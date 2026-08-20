'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface SignupData {
  email: string
  password: string
  restaurantName: string
  whatsapp: string
}

interface PaymentModalProps {
  signupData: SignupData
  onClose: () => void
  /** For renewal flow — user is already logged in */
  renewalMode?: boolean
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any
  }
}

export default function PaymentModal({ signupData, onClose, renewalMode = false }: PaymentModalProps) {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState<'loading' | 'ready' | 'processing' | 'success' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const rzpRef = useRef<unknown>(null)

  // Load Razorpay script
  useEffect(() => {
    if (document.getElementById('razorpay-script')) {
      setStep('ready')
      return
    }
    const script = document.createElement('script')
    script.id = 'razorpay-script'
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => setStep('ready')
    script.onerror = () => {
      setStep('error')
      setErrorMsg('Failed to load payment gateway. Please check your internet connection.')
    }
    document.head.appendChild(script)
  }, [])

  async function openRazorpay() {
    setStep('processing')
    setErrorMsg('')

    try {
      // 1. Create Razorpay order
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signupData }),
      })
      const orderData = await orderRes.json()

      if (!orderRes.ok || !orderData.orderId) {
        throw new Error(orderData.error || 'Could not initiate payment.')
      }

      // 2. Open Razorpay checkout
      const options = {
        key:         orderData.keyId,
        amount:      orderData.amount,
        currency:    orderData.currency,
        order_id:    orderData.orderId,
        name:        'MenuQR',
        description: 'MenuQR Pro — ₹299/month',
        image:       '/favicon.ico',
        prefill: {
          name:    signupData.restaurantName,
          email:   signupData.email,
          contact: signupData.whatsapp.startsWith('+91')
            ? signupData.whatsapp.slice(3)
            : signupData.whatsapp,
        },
        theme: { color: '#E11D48' },
        modal: {
          ondismiss: () => {
            setStep('ready')
          },
        },
        handler: async (response: {
          razorpay_order_id: string
          razorpay_payment_id: string
          razorpay_signature: string
        }) => {
          setStep('processing')
          try {
            const verifyEndpoint = renewalMode
              ? '/api/payment/renew'
              : '/api/payment/verify'

            const verifyRes = await fetch(verifyEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                signupData,
              }),
            })

            const verifyData = await verifyRes.json()

            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || 'Verification failed.')
            }

            if (!renewalMode) {
              // Sign in the new user
              await supabase.auth.signInWithPassword({
                email:    signupData.email,
                password: signupData.password,
              })
            }

            setStep('success')
            setTimeout(() => router.push('/dashboard'), 1800)
          } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unknown error'
            setErrorMsg(msg)
            setStep('error')
          }
        },
      }

      rzpRef.current = new window.Razorpay(options)
      ;(rzpRef.current as { open: () => void }).open()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.'
      setErrorMsg(msg)
      setStep('error')
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)', padding: '40px',
        width: '100%', maxWidth: 440,
        boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
        position: 'relative',
      }}>

        {/* Close button */}
        {step !== 'processing' && step !== 'success' && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 16, right: 16,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', borderRadius: '50%',
              width: 32, height: 32, cursor: 'pointer',
              fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'inherit',
            }}
          >×</button>
        )}

        {/* Success state */}
        {step === 'success' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'var(--brand-success-light)', color: 'var(--brand-success)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px', border: '1px solid var(--brand-success)',
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12, color: 'var(--text-primary)' }}>
              Payment Successful!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
              {renewalMode
                ? 'Your subscription has been renewed for 30 more days.'
                : 'Your account is ready. Heading to your dashboard…'}
            </p>
          </div>
        )}

        {/* Error state */}
        {step === 'error' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'rgba(225, 29, 72, 0.1)', color: 'var(--brand-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px', border: '1px solid var(--brand-primary)',
              fontSize: 36,
            }}>⚠️</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12, color: 'var(--text-primary)' }}>
              Payment Failed
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
              {errorMsg}
            </p>
            <button
              onClick={() => { setStep('ready'); setErrorMsg('') }}
              className="btn-primary"
              style={{ width: '100%' }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading / Ready / Processing states */}
        {(step === 'loading' || step === 'ready' || step === 'processing') && (
          <>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'var(--brand-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', fontSize: 24,
              }}>🍽️</div>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>
                {renewalMode ? 'Renew Subscription' : 'Complete Your Purchase'}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                {renewalMode
                  ? 'Extend your access for another 30 days'
                  : 'One-time setup — your account is ready after payment'}
              </p>
            </div>

            {/* Plan summary */}
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: 28,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                    MenuQR Pro
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>30 days access</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 2px' }}>₹299</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>per month</p>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  'Unlimited menu items',
                  'Live kitchen display screen',
                  'QR code ordering — no app needed',
                  'Analytics dashboard',
                ].map(feature => (
                  <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: 'var(--brand-success)', fontSize: 16 }}>✓</span>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Restaurant name */}
            {!renewalMode && (
              <div style={{
                background: 'rgba(225, 29, 72, 0.06)', border: '1px solid rgba(225, 29, 72, 0.15)',
                borderRadius: 'var(--radius-md)', padding: '10px 16px', marginBottom: 24,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 16 }}>🏪</span>
                <span style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 600 }}>
                  {signupData.restaurantName}
                </span>
              </div>
            )}

            <button
              onClick={openRazorpay}
              disabled={step === 'loading' || step === 'processing'}
              className="btn-primary"
              style={{
                width: '100%', padding: '16px', fontSize: 15,
                textTransform: 'uppercase', letterSpacing: '1px',
                opacity: (step === 'loading' || step === 'processing') ? 0.7 : 1,
                boxShadow: '0 8px 24px rgba(225, 29, 72, 0.3)',
              }}
            >
              {step === 'loading' && '⏳ Loading payment…'}
              {step === 'ready' && '💳 Pay ₹299 Securely'}
              {step === 'processing' && '⏳ Processing…'}
            </button>

            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
              🔒 Secured by Razorpay · UPI, Cards, Net Banking accepted
            </p>
          </>
        )}
      </div>
    </div>
  )
}
