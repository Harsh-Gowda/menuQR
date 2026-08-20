import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * POST /api/payment/create-order
 * Creates a Razorpay order for ₹499/month subscription
 * Body: { signupData: { email, restaurantName, whatsapp } }  (store temporarily)
 */
export async function POST(req: NextRequest) {
  try {
    const keyId     = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: 'Payment system not configured. Please contact support.' },
        { status: 503 }
      )
    }

    const body = await req.json()
    const { signupData } = body

    if (!signupData?.email || !signupData?.restaurantName || !signupData?.whatsapp) {
      return NextResponse.json({ error: 'Missing signup data' }, { status: 400 })
    }

    // Amount in paise (₹499 × 100)
    const amountPaise = 49900

    // Create Razorpay order via their REST API
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount:   amountPaise,
        currency: 'INR',
        receipt:  `menuqr_signup_${Date.now()}`,
        notes: {
          restaurant_name: signupData.restaurantName,
          customer_email:  signupData.email,
        },
      }),
    })

    if (!rzpRes.ok) {
      const errBody = await rzpRes.json()
      console.error('[create-order] Razorpay error:', errBody)
      return NextResponse.json(
        { error: 'Could not initiate payment. Please try again.' },
        { status: 502 }
      )
    }

    const order = await rzpRes.json()

    return NextResponse.json({
      orderId:    order.id,
      amount:     order.amount,
      currency:   order.currency,
      keyId,
    })
  } catch (err) {
    console.error('[create-order] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
