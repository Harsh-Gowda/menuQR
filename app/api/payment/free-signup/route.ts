import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
}

function isValidPassword(password: string): boolean {
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password)
}

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\s+/g, '')
  return /^\d{10}$/.test(digits)
}

/**
 * POST /api/payment/free-signup
 * Creates account without payment — for development/testing only.
 * 
 * Body: { signupData: { email, password, restaurantName, whatsapp } }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { signupData } = body

    // ── 1. Validate signup data ────────────────────────────────────────────
    const email          = (signupData?.email || '').trim().toLowerCase()
    const password       = signupData?.password || ''
    const restaurantName = (signupData?.restaurantName || '').trim()
    const whatsapp       = (signupData?.whatsapp || '').trim().replace(/\s+/g, '')

    if (!isValidEmail(email))
      return NextResponse.json({ error: 'Invalid email.' }, { status: 400 })
    if (!isValidPassword(password))
      return NextResponse.json({ error: 'Invalid password (min 8 chars, include a letter and number).' }, { status: 400 })
    if (!restaurantName || restaurantName.length < 2)
      return NextResponse.json({ error: 'Invalid restaurant name.' }, { status: 400 })
    if (!isValidPhone(whatsapp))
      return NextResponse.json({ error: 'Invalid phone number.' }, { status: 400 })

    const supabase = createServiceClient()

    // ── 2. Create auth user ────────────────────────────────────────────────
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError || !authData.user) {
      const msg = authError?.message?.toLowerCase() || ''
      if (msg.includes('already') || msg.includes('exists')) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please log in.' },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: 'Account creation failed: ' + authError?.message }, { status: 400 })
    }

    const userId = authData.user.id

    // ── 3. Create restaurant row (trial/free, active for 30 days) ──────────
    const slug = slugify(restaurantName) + '-' + Math.random().toString(36).slice(2, 6)
    const formattedPhone = whatsapp.startsWith('+') ? whatsapp : `+91${whatsapp}`
    const now = new Date()
    const subscriptionEndsAt = new Date(now)
    subscriptionEndsAt.setDate(subscriptionEndsAt.getDate() + 30) // 30-day trial

    const { data: restaurantData, error: restError } = await supabase
      .from('restaurants')
      .insert({
        owner_user_id:           userId,
        name_en:                 restaurantName,
        slug,
        whatsapp_number:         formattedPhone,
        currency:                'INR',
        gst_percentage:          5,
        gst_type:                'exclusive',
        plan:                    'paid',
        subscription_active:     true,
        subscription_started_at: now.toISOString(),
        subscription_ends_at:    subscriptionEndsAt.toISOString(),
        trial_ends_at:           null,
      })
      .select('id')
      .single()

    if (restError || !restaurantData) {
      // Rollback auth user
      await supabase.auth.admin.deleteUser(userId)
      console.error('[free-signup] restaurant insert error:', restError?.message)
      return NextResponse.json({ error: 'Account setup failed. ' + restError?.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      userId,
      restaurantId: restaurantData.id,
    })
  } catch (err) {
    console.error('[free-signup] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
