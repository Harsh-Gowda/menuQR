'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2 } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [restaurantName, setRestaurantName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, restaurantName, whatsapp }),
    })
    const result = await res.json()

    if (!res.ok || !result.success) {
      setError(result.error || 'Signup failed')
      setLoading(false)
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/dashboard'), 1500)
  }

  if (success) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-surface)', padding: 24,
      }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }} className="animate-slide-up">
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: '#dcfce7', color: '#166534',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <CheckCircle2 size={40} />
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 12, color: 'var(--text-primary)' }}>
            Account Created!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>
            Heading to your dashboard…
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-surface)' }}>
      {/* Left panel */}
      <div style={{
        display: 'none', flex: 1, flexDirection: 'column', justifyContent: 'center',
        padding: '60px clamp(40px,5vw,80px)', background: '#ffffff', borderRight: '1px solid var(--border)',
      }} className="auth-left-panel">
        <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 56 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'var(--brand-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: 20,
          }}>M</div>
          <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            MenuQR
          </span>
        </Link>

        <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1.5px', color: 'var(--text-primary)', lineHeight: 1.15, marginBottom: 20 }}>
          Setup your digital menu in minutes.
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 18, lineHeight: 1.6, marginBottom: 40 }}>
          Join hundreds of restaurants using MenuQR to streamline orders and grow their business.
        </p>

        {/* Mini checklist */}
        {['No credit card required', 'Cancel anytime', '14-day full feature trial', 'Dedicated support'].map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <CheckCircle2 color="var(--brand-primary)" size={20} style={{ flexShrink: 0 }} />
            <span style={{ color: 'var(--text-secondary)', fontSize: 16, fontWeight: 500 }}>{f}</span>
          </div>
        ))}
      </div>

      {/* Right panel — form */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          {/* Mobile logo */}
          <div className="mobile-logo" style={{ display: 'none', marginBottom: 32, justifyContent: 'center' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'var(--brand-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 800, fontSize: 18,
              }}>M</div>
              <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                MenuQR
              </span>
            </Link>
          </div>

          <div className="card" style={{ padding: '40px 32px' }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 8, color: 'var(--text-primary)' }}>
              Start your free trial
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 32 }}>
              Free for 14 days. No credit card required.
            </p>

            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #f87171',
                borderRadius: 8, padding: '12px 16px', marginBottom: 24,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ color: '#ef4444' }}>⚠️</span>
                <span style={{ color: '#b91c1c', fontSize: 14 }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                  Restaurant Name
                </label>
                <input
                  id="signup-restaurant-name"
                  type="text"
                  value={restaurantName}
                  onChange={e => setRestaurantName(e.target.value)}
                  placeholder="e.g., Spice Garden"
                  required
                  className="input-base"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                  Contact Number
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{
                    background: '#f3f4f6', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)', padding: '12px 14px', fontSize: 15,
                    color: 'var(--text-secondary)', whiteSpace: 'nowrap', flexShrink: 0,
                  }}>+91</div>
                  <input
                    id="signup-whatsapp"
                    type="tel"
                    value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value)}
                    placeholder="98765 43210"
                    required
                    className="input-base"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                  Work Email
                </label>
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@restaurant.com"
                  required
                  className="input-base"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                  Password
                </label>
                <input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  minLength={8}
                  required
                  className="input-base"
                />
              </div>

              <button
                id="signup-submit"
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ marginTop: 8, fontSize: 16, width: '100%', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? (
                  <><span className="animate-spin" style={{ display: 'inline-block' }}>⏳</span> Creating account…</>
                ) : 'Create Account'}
              </button>

              <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
                By signing up, you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>
          </div>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 15, color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 860px) { .auth-left-panel { display: flex !important; } }
        @media (max-width: 859px) { .mobile-logo { display: flex !important; } }
      `}</style>
    </div>
  )
}
