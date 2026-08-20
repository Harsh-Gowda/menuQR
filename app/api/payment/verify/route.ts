import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
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
 * POST /api/payment/verify
 * Verifies Razorpay payment signature, then creates the account.
 *
 * Body:
 *  - razorpay_order_id
 *  - razorpay_payment_id
 *  - razorpay_signature
 *  - signupData: { email, password, restaurantName, whatsapp }
 */
export async function POST(req: NextRequest) {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keySecret) {
      return NextResponse.json({ error: 'Payment system not configured.' }, { status: 503 })
    }

    const body = await req.json()
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      signupData,
    } = body

    // ── 1. Verify Razorpay signature ───────────────────────────────────────
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment verification data.' }, { status: 400 })
    }

    const expectedSig = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expectedSig !== razorpay_signature) {
      console.warn('[verify] Signature mismatch — possible tamper attempt')
      return NextResponse.json(
        { error: 'Payment verification failed. Please contact support.' },
        { status: 400 }
      )
    }

    // ── 2. Validate signup data ────────────────────────────────────────────
    const email          = (signupData?.email || '').trim().toLowerCase()
    const password       = signupData?.password || ''
    const restaurantName = (signupData?.restaurantName || '').trim()
    const whatsapp       = (signupData?.whatsapp || '').trim().replace(/\s+/g, '')

    if (!isValidEmail(email))   return NextResponse.json({ error: 'Invalid email.' }, { status: 400 })
    if (!isValidPassword(password)) return NextResponse.json({ error: 'Invalid password.' }, { status: 400 })
    if (!restaurantName || restaurantName.length < 2) return NextResponse.json({ error: 'Invalid restaurant name.' }, { status: 400 })
    if (!isValidPhone(whatsapp)) return NextResponse.json({ error: 'Invalid phone number.' }, { status: 400 })

    const supabase = createServiceClient()

    // ── 3. Create auth user ────────────────────────────────────────────────
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
      return NextResponse.json({ error: 'Account creation failed.' }, { status: 400 })
    }

    const userId = authData.user.id

    // ── 4. Create restaurant row (paid, active) ────────────────────────────
    const slug = slugify(restaurantName) + '-' + Math.random().toString(36).slice(2, 6)
    const formattedPhone = whatsapp.startsWith('+') ? whatsapp : `+91${whatsapp}`
    const now = new Date()
    const subscriptionEndsAt = new Date(now)
    subscriptionEndsAt.setDate(subscriptionEndsAt.getDate() + 30) // 30 days from now

    const { data: restaurantData, error: restError } = await supabase
      .from('restaurants')
      .insert({
        owner_user_id:          userId,
        name_en:                restaurantName,
        slug,
        whatsapp_number:        formattedPhone,
        currency:               'INR',
        gst_percentage:         5,
        gst_type:               'exclusive',
        plan:                   'paid',
        subscription_active:    true,
        subscription_started_at: now.toISOString(),
        subscription_ends_at:   subscriptionEndsAt.toISOString(),
        trial_ends_at:          null,
      })
      .select('id')
      .single()

    if (restError || !restaurantData) {
      // Rollback auth user
      await supabase.auth.admin.deleteUser(userId)
      console.error('[verify] restaurant insert error:', restError?.message)
      return NextResponse.json({ error: 'Account setup failed. Contact support.' }, { status: 500 })
    }

    // ── 5. Log the payment ─────────────────────────────────────────────────
    await supabase.from('payment_logs').insert({
      restaurant_id:       restaurantData.id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount_inr:          299,
      status:              'success',
      payment_type:        'signup',
    })

    return NextResponse.json({
      success: true,
      userId,
      restaurantId: restaurantData.id,
    })
  } catch (err) {
    console.error('[verify] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
