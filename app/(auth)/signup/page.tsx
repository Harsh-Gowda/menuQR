'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const PaymentModal = dynamic(() => import('@/components/PaymentModal'), { ssr: false })

// ── Validation helpers ─────────────────────────────────────────────────────────
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())
}
function isValidPassword(password: string) {
  // min 8 chars, at least 1 letter AND 1 number
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password)
}
function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0
  if (password.length >= 8)            score++
  if (password.length >= 12)           score++
  if (/[A-Z]/.test(password))          score++
  if (/[0-9]/.test(password))          score++
  if (/[^a-zA-Z0-9]/.test(password))  score++
  if (score <= 1) return { score, label: 'Weak',   color: '#E11D48' }
  if (score <= 2) return { score, label: 'Fair',   color: '#f59e0b' }
  if (score <= 3) return { score, label: 'Good',   color: '#3b82f6' }
  return             { score, label: 'Strong', color: '#16a34a' }
}
function isValidPhone(phone: string) {
  return /^\d{10}$/.test(phone.replace(/\s+/g, ''))
}

// ── SVG icons (inline, no emoji — works reliably everywhere) ──────────────────
function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}
function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

export default function SignupPage() {
  const [email, setEmail]                 = useState('')
  const [password, setPassword]           = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword]   = useState(false)
  const [showConfirm, setShowConfirm]     = useState(false)
  const [restaurantName, setRestaurantName] = useState('')
  const [whatsapp, setWhatsapp]           = useState('')
  const [touched, setTouched]             = useState<Record<string, boolean>>({})
  const [showPayment, setShowPayment]     = useState(false)
  const [formError, setFormError]         = useState('')

  const strength = getPasswordStrength(password)

  // ── Field-level errors (only shown after field is touched) ─────────────────
  const errors = {
    restaurantName: restaurantName.trim().length < 2
      ? 'Enter your restaurant name (min 2 characters)' : '',
    whatsapp: !isValidPhone(whatsapp)
      ? 'Enter a valid 10-digit mobile number' : '',
    email: !isValidEmail(email)
      ? 'Enter a valid email address' : '',
    password: !isValidPassword(password)
      ? 'Min 8 characters, include at least one letter and one number' : '',
    confirmPassword: password !== confirmPassword
      ? 'Passwords do not match' : '',
  }

  const isFormValid = Object.values(errors).every(e => !e)

  const touchAll = useCallback(() => {
    setTouched({
      restaurantName: true, whatsapp: true,
      email: true, password: true, confirmPassword: true,
    })
  }, [])

  function handleContinue(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    touchAll()
    if (!isFormValid) {
      setFormError('Please fix the errors highlighted below.')
      return
    }
    setShowPayment(true)
  }

  // ── Eye toggle handler (explicit, no functional update to avoid stale closure) ──
  function toggleShowPassword(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    e.stopPropagation()
    setShowPassword(prev => !prev)
  }
  function toggleShowConfirm(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    e.stopPropagation()
    setShowConfirm(prev => !prev)
  }

  // ── Field wrapper style helper ─────────────────────────────────────────────
  const fieldBorder = (field: string) =>
    touched[field] && errors[field as keyof typeof errors]
      ? 'var(--brand-primary)'
      : touched[field] && !errors[field as keyof typeof errors]
      ? '#16a34a'
      : 'var(--border)'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-base)', position: 'relative' }}>

      {/* Background Decor */}
      <div style={{ position: 'absolute', bottom: -100, right: -100, width: 600, height: 600, background: 'radial-gradient(circle, rgba(225, 29, 72, 0.08) 0%, rgba(17,17,17,0) 70%)', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: -50, left: -50, width: 400, height: 400, background: 'radial-gradient(circle, rgba(225, 29, 72, 0.05) 0%, rgba(17,17,17,0) 70%)', zIndex: 0, pointerEvents: 'none' }} />

      {/* Left panel (desktop only) */}
      <div style={{
        display: 'none', flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        padding: '60px clamp(40px,5vw,80px)', background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)', position: 'relative', overflow: 'hidden'
      }} className="auth-left-panel">
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 480 }}>
          <img
            src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            alt="Food"
            style={{ width: 280, height: 280, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 20px 50px rgba(0,0,0,0.8)', border: '6px solid var(--brand-primary)', margin: '0 auto 36px' }}
          />
          <h2 style={{ fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: 16 }}>
            Your digital menu,{' '}
            <span style={{ color: 'var(--brand-primary)' }}>live in minutes.</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, marginBottom: 36 }}>
            Restaurants using MenuQR see faster orders, happier kitchens, and zero commission fees.
          </p>
          {/* Pricing badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 16,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '18px 28px',
          }}>
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px' }}>One flat rate</p>
              <p style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>
                ₹299<span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>/mo</span>
              </p>
            </div>
            <div style={{ width: 1, height: 36, background: 'var(--border)' }} />
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px' }}>Zero commission</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#16a34a', margin: 0 }}>All features included</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', position: 'relative', zIndex: 1
      }}>
        <div style={{ width: '100%', maxWidth: 460 }}>

          {/* Mobile logo */}
          <div className="mobile-logo" style={{ display: 'none', marginBottom: 32, justifyContent: 'center' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 18 }}>🍽️</div>
              <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>MenuQR</span>
            </Link>
          </div>

          <div className="card animate-scale-in" style={{ padding: '40px', background: 'var(--bg-surface)' }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6, color: 'var(--text-primary)' }}>
              Create Your Account
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
              Fill your details, then pay ₹299 to activate your account.
            </p>

            {/* Pricing pill */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(225, 29, 72, 0.08)', border: '1px solid rgba(225, 29, 72, 0.2)',
              borderRadius: '100px', padding: '5px 14px', fontSize: 13, fontWeight: 700,
              color: 'var(--brand-primary)', marginBottom: 24,
            }}>
              💳 ₹299/month · All features included
            </div>

            {/* Form-level error */}
            {formError && (
              <div style={{
                background: 'rgba(225, 29, 72, 0.08)', border: '1px solid rgba(225, 29, 72, 0.3)',
                borderRadius: 'var(--radius-md)', padding: '11px 16px', marginBottom: 20,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ color: 'var(--brand-primary)', fontSize: 16 }}>⚠</span>
                <span style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 600 }}>{formError}</span>
              </div>
            )}

            <form onSubmit={handleContinue} style={{ display: 'flex', flexDirection: 'column', gap: 18 }} noValidate autoComplete="off">

              {/* ── Restaurant Name ── */}
              <div>
                <label style={labelStyle}>Restaurant Name</label>
                <input
                  id="signup-restaurant-name"
                  type="text"
                  value={restaurantName}
                  maxLength={100}
                  onChange={e => setRestaurantName(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, restaurantName: true }))}
                  placeholder="e.g., Spice Garden"
                  autoComplete="organization"
                  className="input-base"
                  style={{ ...inputStyle, borderColor: fieldBorder('restaurantName') }}
                />
                <FieldMsg touched={touched.restaurantName} error={errors.restaurantName} />
              </div>

              {/* ── Mobile Number ── */}
              <div>
                <label style={labelStyle}>Mobile Number (WhatsApp)</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ background: 'var(--bg-base)', border: `1.5px solid var(--border)`, borderRadius: 'var(--radius-md)', padding: '14px 16px', fontSize: 15, color: 'var(--text-secondary)', whiteSpace: 'nowrap', flexShrink: 0 }}>+91</div>
                  <input
                    id="signup-whatsapp"
                    type="tel"
                    value={whatsapp}
                    maxLength={10}
                    onChange={e => setWhatsapp(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    onBlur={() => setTouched(t => ({ ...t, whatsapp: true }))}
                    placeholder="98765 43210"
                    autoComplete="tel-national"
                    className="input-base"
                    style={{ ...inputStyle, flex: 1, borderColor: fieldBorder('whatsapp') }}
                  />
                </div>
                <FieldMsg touched={touched.whatsapp} error={errors.whatsapp} />
              </div>

              {/* ── Email ── */}
              <div>
                <label style={labelStyle}>Email Address</label>
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  maxLength={200}
                  onChange={e => setEmail(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, email: true }))}
                  placeholder="you@restaurant.com"
                  autoComplete="email"
                  className="input-base"
                  style={{ ...inputStyle, borderColor: fieldBorder('email') }}
                />
                <FieldMsg touched={touched.email} error={errors.email} />
              </div>

              {/* ── Password ── */}
              <div>
                <label style={labelStyle}>Password</label>
                {/* IMPORTANT: wrapper must be position:relative with overflow:visible */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    maxLength={128}
                    onChange={e => setPassword(e.target.value)}
                    onBlur={() => setTouched(t => ({ ...t, password: true }))}
                    placeholder="Min 8 chars, include a number"
                    autoComplete="new-password"
                    className="input-base"
                    style={{ ...inputStyle, paddingRight: 48, borderColor: fieldBorder('password'), width: '100%' }}
                  />
                  {/* Eye toggle — type="button" prevents form submit */}
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={toggleShowPassword}
                    style={{
                      position: 'absolute',
                      right: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px',
                      zIndex: 10,
                      lineHeight: 0,
                    }}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>

                {/* Strength bars */}
                {password.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{
                          flex: 1, height: 3, borderRadius: 2,
                          background: strength.score >= i ? strength.color : 'var(--border)',
                          transition: 'background 0.25s',
                        }} />
                      ))}
                    </div>
                    <p style={{ fontSize: 11, color: strength.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                      {strength.label} password
                    </p>
                  </div>
                )}
                <FieldMsg touched={touched.password} error={errors.password} />
              </div>

              {/* ── Confirm Password ── */}
              <div>
                <label style={labelStyle}>Confirm Password</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    id="signup-confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    maxLength={128}
                    onChange={e => setConfirmPassword(e.target.value)}
                    onBlur={() => setTouched(t => ({ ...t, confirmPassword: true }))}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    className="input-base"
                    style={{ ...inputStyle, paddingRight: 48, borderColor: fieldBorder('confirmPassword'), width: '100%' }}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    onClick={toggleShowConfirm}
                    style={{
                      position: 'absolute',
                      right: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px',
                      zIndex: 10,
                      lineHeight: 0,
                    }}
                  >
                    {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>

                {/* Match indicator */}
                {confirmPassword.length > 0 && (
                  <p style={{ fontSize: 11, fontWeight: 700, margin: '6px 0 0', textTransform: 'uppercase', letterSpacing: '0.5px', color: password === confirmPassword ? '#16a34a' : '#E11D48', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {password === confirmPassword
                      ? <><CheckIcon /> Passwords match</>
                      : '✗ Passwords do not match'
                    }
                  </p>
                )}
                <FieldMsg touched={touched.confirmPassword} error={errors.confirmPassword} />
              </div>

              {/* ── Security notice ── */}
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                🔒 Your data is encrypted and protected by Supabase secure infrastructure.
              </p>

              <button
                id="signup-submit"
                type="submit"
                className="btn-primary"
                style={{ marginTop: 4, width: '100%', textTransform: 'uppercase', letterSpacing: '1px', boxShadow: '0 8px 24px rgba(225, 29, 72, 0.25)', padding: '15px' }}
              >
                Continue to Payment →
              </button>
            </form>
          </div>

          <p className="animate-slide-up" style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--brand-primary)', fontWeight: 700, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>

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

// ── Shared style objects ────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  color: 'var(--text-secondary)',
  marginBottom: 7,
  textTransform: 'uppercase',
  letterSpacing: '1px',
}
const inputStyle: React.CSSProperties = {
  background: 'var(--bg-base)',
}

// ── Inline field error component ────────────────────────────────────────────────
function FieldMsg({ touched, error }: { touched: boolean | undefined; error: string }) {
  if (!touched) return null
  if (error) {
    return (
      <p style={{ fontSize: 11, color: '#E11D48', marginTop: 5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
        ⚠ {error}
      </p>
    )
  }
  return (
    <p style={{ fontSize: 11, color: '#16a34a', marginTop: 5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
      <CheckIcon /> Looks good
    </p>
  )
}
