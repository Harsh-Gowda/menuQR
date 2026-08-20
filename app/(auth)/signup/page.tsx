'use client'

import { useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// Dynamically load PaymentModal so Razorpay script isn't loaded on every page
const PaymentModal = dynamic(() => import('@/components/PaymentModal'), { ssr: false })

// ── Validation helpers ─────────────────────────────────────────────────────────
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())
}
function isValidPassword(password: string) {
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password)
}
function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  if (score <= 1) return { score, label: 'Weak', color: '#E11D48' }
  if (score <= 2) return { score, label: 'Fair', color: '#f59e0b' }
  if (score <= 3) return { score, label: 'Good', color: '#3b82f6' }
  return { score, label: 'Strong', color: '#16a34a' }
}
function isValidPhone(phone: string) {
  return /^\d{10}$/.test(phone.replace(/\s+/g, ''))
}

export default function SignupPage() {
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [restaurantName, setRestaurantName] = useState('')
  const [whatsapp, setWhatsapp]         = useState('')
  const [touched, setTouched]           = useState<Record<string, boolean>>({})
  const [showPayment, setShowPayment]   = useState(false)
  const [formError, setFormError]       = useState('')

  const strength = getPasswordStrength(password)

  // Field-level errors (only shown after field is touched)
  const errors = {
    restaurantName: !restaurantName.trim() || restaurantName.trim().length < 2
      ? 'Enter your restaurant name (min 2 characters)' : '',
    whatsapp: !isValidPhone(whatsapp)
      ? 'Enter a valid 10-digit mobile number' : '',
    email: !isValidEmail(email)
      ? 'Enter a valid email address' : '',
    password: !isValidPassword(password)
      ? 'Min 8 characters, with at least one letter and one number' : '',
  }

  const isFormValid = Object.values(errors).every(e => !e)

  function touchAll() {
    setTouched({ restaurantName: true, whatsapp: true, email: true, password: true })
  }

  function handleContinue(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    touchAll()
    if (!isFormValid) {
      setFormError('Please fix the errors above before continuing.')
      return
    }
    setShowPayment(true)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-base)', position: 'relative' }}>

      {/* Background Decor */}
      <div style={{ position: 'absolute', bottom: -100, right: -100, width: 600, height: 600, background: 'radial-gradient(circle, rgba(225, 29, 72, 0.1) 0%, rgba(17,17,17,0) 70%)', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: -50, left: -50, width: 400, height: 400, background: 'radial-gradient(circle, rgba(225, 29, 72, 0.06) 0%, rgba(17,17,17,0) 70%)', zIndex: 0 }} />

      {/* Left panel */}
      <div style={{
        display: 'none', flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        padding: '60px clamp(40px,5vw,80px)', background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)', position: 'relative', overflow: 'hidden'
      }} className="auth-left-panel">

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 500 }}>
          <img
            src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            alt="Food"
            style={{
              width: 300, height: 300, borderRadius: '50%', objectFit: 'cover',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)', border: '8px solid var(--brand-primary)',
              margin: '0 auto 40px'
            }}
          />
          <h2 style={{ fontSize: 'clamp(32px, 3vw, 48px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: 20 }}>
            Your digital menu, <span style={{ color: 'var(--brand-primary)' }}>live in minutes.</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.6 }}>
            Join restaurants using MenuQR to deliver frictionless, digital ordering directly to their kitchen screens.
          </p>

          {/* Pricing badge */}
          <div style={{
            marginTop: 40, display: 'inline-flex', alignItems: 'center', gap: 16,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '20px 32px',
          }}>
            <div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px' }}>One flat rate</p>
              <p style={{ fontSize: 36, fontWeight: 900, color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>₹499<span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>/mo</span></p>
            </div>
            <div style={{ width: 1, height: 40, background: 'var(--border)' }} />
            <div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px' }}>Zero commission</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--brand-success)', margin: 0 }}>All features included</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', position: 'relative', zIndex: 1
      }}>
        <div style={{ width: '100%', maxWidth: 440 }}>

          {/* Mobile logo */}
          <div className="mobile-logo" style={{ display: 'none', marginBottom: 32, justifyContent: 'center' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'var(--brand-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 900, fontSize: 18,
              }}>🍽️</div>
              <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                MenuQR
              </span>
            </Link>
          </div>

          <div className="card animate-scale-in" style={{ padding: '40px', background: 'var(--bg-surface)' }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8, color: 'var(--text-primary)' }}>
              Create Your Account
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>
              Fill in your details, then complete payment to activate your account.
            </p>

            {/* Pricing pill */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(225, 29, 72, 0.08)', border: '1px solid rgba(225, 29, 72, 0.2)',
              borderRadius: '100px', padding: '6px 14px', fontSize: 13, fontWeight: 700,
              color: 'var(--brand-primary)', marginBottom: 28, letterSpacing: '0.5px',
            }}>
              <span>💳</span> ₹499/month · All features included
            </div>

            {formError && (
              <div style={{
                background: 'rgba(225, 29, 72, 0.1)', border: '1px solid var(--brand-primary)',
                borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 24,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ color: 'var(--brand-primary)' }}>⚠️</span>
                <span style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 600 }}>{formError}</span>
              </div>
            )}

            <form onSubmit={handleContinue} style={{ display: 'flex', flexDirection: 'column', gap: 20 }} noValidate>

              {/* Restaurant Name */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Restaurant Name
                </label>
                <input
                  id="signup-restaurant-name"
                  type="text"
                  value={restaurantName}
                  onChange={e => setRestaurantName(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, restaurantName: true }))}
                  placeholder="e.g., Spice Garden"
                  required
                  className="input-base"
                  style={{ background: 'var(--bg-base)', borderColor: touched.restaurantName && errors.restaurantName ? 'var(--brand-primary)' : undefined }}
                />
                {touched.restaurantName && errors.restaurantName && (
                  <p style={{ fontSize: 12, color: 'var(--brand-primary)', marginTop: 6, fontWeight: 600 }}>
                    ⚠ {errors.restaurantName}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Mobile Number (WhatsApp)
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{
                    background: 'var(--bg-base)', border: '1.5px solid var(--border)',
                    borderRadius: 'var(--radius-md)', padding: '14px 16px', fontSize: 16,
                    color: 'var(--text-secondary)', whiteSpace: 'nowrap', flexShrink: 0,
                  }}>+91</div>
                  <input
                    id="signup-whatsapp"
                    type="tel"
                    value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    onBlur={() => setTouched(t => ({ ...t, whatsapp: true }))}
                    placeholder="98765 43210"
                    required
                    className="input-base"
                    style={{ background: 'var(--bg-base)', flex: 1, borderColor: touched.whatsapp && errors.whatsapp ? 'var(--brand-primary)' : undefined }}
                  />
                </div>
                {touched.whatsapp && errors.whatsapp && (
                  <p style={{ fontSize: 12, color: 'var(--brand-primary)', marginTop: 6, fontWeight: 600 }}>
                    ⚠ {errors.whatsapp}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Email Address
                </label>
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, email: true }))}
                  placeholder="you@restaurant.com"
                  required
                  className="input-base"
                  style={{ background: 'var(--bg-base)', borderColor: touched.email && errors.email ? 'var(--brand-primary)' : undefined }}
                />
                {touched.email && errors.email && (
                  <p style={{ fontSize: 12, color: 'var(--brand-primary)', marginTop: 6, fontWeight: 600 }}>
                    ⚠ {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onBlur={() => setTouched(t => ({ ...t, password: true }))}
                    placeholder="Min 8 characters, include a number"
                    required
                    className="input-base"
                    style={{ background: 'var(--bg-base)', paddingRight: 48, borderColor: touched.password && errors.password ? 'var(--brand-primary)' : undefined }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    style={{
                      position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', fontSize: 18, padding: 0,
                    }}
                  >{showPassword ? '🙈' : '👁️'}</button>
                </div>

                {/* Password strength */}
                {password.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{
                          flex: 1, height: 3, borderRadius: 2,
                          background: strength.score >= i ? strength.color : 'var(--border)',
                          transition: 'background 0.3s',
                        }} />
                      ))}
                    </div>
                    <p style={{ fontSize: 11, color: strength.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {strength.label}
                    </p>
                  </div>
                )}

                {touched.password && errors.password && (
                  <p style={{ fontSize: 12, color: 'var(--brand-primary)', marginTop: 6, fontWeight: 600 }}>
                    ⚠ {errors.password}
                  </p>
                )}
              </div>

              <button
                id="signup-submit"
                type="submit"
                className="btn-primary"
                style={{ marginTop: 8, width: '100%', textTransform: 'uppercase', letterSpacing: '1px', boxShadow: '0 8px 24px rgba(225, 29, 72, 0.3)' }}
              >
                Continue to Payment →
              </button>
            </form>
          </div>

          <p className="animate-slide-up" style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)', animationDelay: '0.1s' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--brand-primary)', fontWeight: 700, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          signupData={{ email, password, restaurantName, whatsapp }}
          onClose={() => setShowPayment(false)}
        />
      )}

      <style>{`
        @media (min-width: 960px) { .auth-left-panel { display: flex !important; } }
        @media (max-width: 959px) { .mobile-logo { display: flex !important; } }
      `}</style>
    </div>
  )
}
