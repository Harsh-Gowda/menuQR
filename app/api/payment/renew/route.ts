import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

/**
 * POST /api/payment/renew
 * Verifies a renewal Razorpay payment and extends subscription by 30 days.
 *
 * Body:
 *  - razorpay_order_id
 *  - razorpay_payment_id
 *  - razorpay_signature
 */
export async function POST(req: NextRequest) {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keySecret) {
      return NextResponse.json({ error: 'Payment system not configured.' }, { status: 503 })
    }

    // ── 1. Authenticate the logged-in user ────────────────────────────────
    const supabaseServer = await createServerClient()
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
    }

    // ── 2. Verify Razorpay signature ──────────────────────────────────────
    const body = await req.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment data.' }, { status: 400 })
    }

    const expectedSig = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expectedSig !== razorpay_signature) {
      console.warn('[renew] Signature mismatch')
      return NextResponse.json({ error: 'Payment verification failed.' }, { status: 400 })
    }

    // ── 3. Get their restaurant ───────────────────────────────────────────
    const supabase = createServiceClient()
    const { data: restaurant, error: restError } = await supabase
      .from('restaurants')
      .select('id, subscription_ends_at, is_developer_account')
      .eq('owner_user_id', user.id)
      .single()

    if (restError || !restaurant) {
      return NextResponse.json({ error: 'Restaurant not found.' }, { status: 404 })
    }

    if (restaurant.is_developer_account) {
      return NextResponse.json({ error: 'Developer accounts do not need renewal.' }, { status: 400 })
    }

    // ── 4. Extend subscription by 30 days ─────────────────────────────────
    // If already expired, renew from today; otherwise extend from current end date
    const now = new Date()
    const currentEnd = restaurant.subscription_ends_at
      ? new Date(restaurant.subscription_ends_at)
      : now
    const base = currentEnd > now ? currentEnd : now
    const newEnd = new Date(base)
    newEnd.setDate(newEnd.getDate() + 30)

    const { error: updateError } = await supabase
      .from('restaurants')
      .update({
        plan:                 'paid',
        subscription_active:  true,
        subscription_ends_at: newEnd.toISOString(),
      })
      .eq('id', restaurant.id)

    if (updateError) {
      console.error('[renew] update error:', updateError.message)
      return NextResponse.json({ error: 'Could not update subscription.' }, { status: 500 })
    }

    // ── 5. Log the payment ────────────────────────────────────────────────
    await supabase.from('payment_logs').insert({
      restaurant_id:       restaurant.id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount_inr:          299,
      status:              'success',
      payment_type:        'renewal',
    })

    return NextResponse.json({
      success: true,
      subscriptionEndsAt: newEnd.toISOString(),
    })
  } catch (err) {
    console.error('[renew] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
