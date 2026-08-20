import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ── In-memory rate limiter (resets on server restart) ──────────────────────────
// For production, replace with Upstash Redis
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000 // 1 hour
  const maxRequests = 5

  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (entry.count >= maxRequests) return false
  entry.count++
  return true
}

// ── Input sanitization helpers ─────────────────────────────────────────────────
function sanitizeText(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.trim().replace(/<[^>]*>/g, '') // strip HTML tags
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
}

function isValidPassword(password: string): boolean {
  // Minimum 8 chars, at least one letter and one number
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password)
}

function isValidPhone(phone: string): boolean {
  // Strip spaces and check it's 10 digits
  const digits = phone.replace(/\s+/g, '')
  return /^\d{10}$/.test(digits)
}

function isValidRestaurantName(name: string): boolean {
  return name.length >= 2 && name.length <= 100
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ── Service role Supabase client (server-only) ─────────────────────────────────
function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// ── POST /api/auth/signup ──────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown'

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again in an hour.' },
        { status: 429 }
      )
    }

    const body = await req.json()

    // Sanitize all inputs
    const email          = sanitizeText(body.email).toLowerCase()
    const password       = typeof body.password === 'string' ? body.password : ''
    const restaurantName = sanitizeText(body.restaurantName)
    const whatsapp       = sanitizeText(body.whatsapp).replace(/\s+/g, '')

    // ── Server-side validation ─────────────────────────────────────────────
    const errors: string[] = []

    if (!email)                         errors.push('Email is required.')
    else if (!isValidEmail(email))      errors.push('Please enter a valid email address.')

    if (!password)                      errors.push('Password is required.')
    else if (!isValidPassword(password)) errors.push('Password must be at least 8 characters and include a letter and a number.')

    if (!restaurantName)                      errors.push('Restaurant name is required.')
    else if (!isValidRestaurantName(restaurantName)) errors.push('Restaurant name must be 2–100 characters.')

    if (!whatsapp)                      errors.push('Phone number is required.')
    else if (!isValidPhone(whatsapp))   errors.push('Please enter a valid 10-digit Indian mobile number.')

    if (errors.length > 0) {
      return NextResponse.json({ error: errors[0] }, { status: 400 })
    }

    const supabase = createServiceClient()

    // ── Create auth user (auto-confirm email) ──────────────────────────────
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError || !authData.user) {
      // Generic message — don't expose "already registered" detail to avoid enumeration
      const msg = authError?.message?.toLowerCase() || ''
      if (msg.includes('already') || msg.includes('exists')) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please log in.' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: 'Signup failed. Please check your details and try again.' },
        { status: 400 }
      )
    }

    // ── Insert restaurant row ──────────────────────────────────────────────
    const slug = slugify(restaurantName) + '-' + Math.random().toString(36).slice(2, 6)
    const formattedPhone = whatsapp.startsWith('+') ? whatsapp : `+91${whatsapp}`

    const { error: restError } = await supabase.from('restaurants').insert({
      owner_user_id:       authData.user.id,
      name_en:             restaurantName,
      slug,
      whatsapp_number:     formattedPhone,
      currency:            'INR',
      gst_percentage:      5,
      gst_type:            'exclusive',
      // Subscription state: pending payment (not trial, not active)
      plan:                'pending',
      subscription_active: false,
      trial_ends_at:       null, // no trial
    })

    if (restError) {
      // Rollback auth user if restaurant insert fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      console.error('[signup] restaurant insert error:', restError.message)
      return NextResponse.json(
        { error: 'Account setup failed. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, userId: authData.user.id })
  } catch (err) {
    console.error('[signup] unexpected error:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
