'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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
    setTimeout(() => router.push('/dashboard'), 1800)
  }

  if (success) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-base)', padding: 24,
      }}>
        <div className="animate-bounce-in" style={{ textAlign: 'center', maxWidth: 360 }}>
          <div style={{
            width: 100, height: 100, borderRadius: '50%',
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 48, margin: '0 auto 24px',
            animation: 'float 3s ease-in-out infinite',
          }}>🎉</div>
          <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 12, color: '#f0f0ff' }}>
            You&apos;re all set!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>
            Heading to your dashboard…
          </p>
          <div style={{
            width: 200, height: 3, background: 'var(--border)', borderRadius: 3,
            margin: '24px auto 0', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: '100%',
              background: 'linear-gradient(90deg,#ff6b35,#f7c948)',
              animation: 'progress 1.8s linear forwards',
              transformOrigin: 'left',
            }} />
          </div>
        </div>
        <style>{`
          @keyframes progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
          @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', background: 'var(--bg-base)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Glow orbs */}
      <div className="glow-orb" style={{ width: 500, height: 500, background: 'rgba(255,107,53,0.09)', top: -150, right: -150 }} />
      <div className="glow-orb" style={{ width: 350, height: 350, background: 'rgba(99,102,241,0.07)', bottom: -100, left: -100 }} />

      {/* Left panel */}
      <div style={{
        display: 'none', flex: 1, flexDirection: 'column', justifyContent: 'center',
        padding: '60px', borderRight: '1px solid var(--border)', position: 'relative',
      }} className="auth-left-panel">
        <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 56 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg,#ff6b35,#f7c948)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
          }}>🍽️</div>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#f0f0ff' }}>Menu<span style={{ color: '#ff6b35' }}>QR</span></span>
        </Link>

        <div style={{
          display: 'inline-block', fontSize: 11, fontWeight: 800, letterSpacing: '0.1em',
          color: '#4ade80', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: 6, padding: '4px 12px', marginBottom: 24,
        }}>14-DAY FREE TRIAL</div>

        <h2 style={{ fontSize: 38, fontWeight: 900, letterSpacing: '-1.5px', color: '#f0f0ff', lineHeight: 1.15, marginBottom: 20 }}>
          One signup.<br /><span className="gradient-text">Infinite orders.</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.7, marginBottom: 36 }}>
          Set up your digital menu in 20 minutes. No commission, no middleman — orders go straight to your kitchen.
        </p>

        {/* Mini checklist */}
        {['Setup in under 20 minutes', 'No WhatsApp required', 'QR codes for every table', 'Real-time kitchen display', '₹499/month after trial'].map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 22, height: 22, borderRadius: 6,
              background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ color: '#4ade80', fontSize: 12 }}>✓</span>
            </div>
            <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{f}</span>
          </div>
        ))}
      </div>

      {/* Right panel — form */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', position: 'relative', zIndex: 1,
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Mobile logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40, justifyContent: 'center' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg,#ff6b35,#f7c948)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>🍽️</div>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#f0f0ff' }}>Menu<span style={{ color: '#ff6b35' }}>QR</span></span>
          </Link>

          <div style={{
            background: 'rgba(15,15,26,0.6)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 24, padding: '36px 32px', backdropFilter: 'blur(20px)',
          }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.4px', marginBottom: 6, color: '#f0f0ff' }}>
              Create your account
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>
              Free for 14 days. No credit card.
            </p>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 12, padding: '12px 16px', marginBottom: 20,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span>⚠️</span>
                <span style={{ color: '#f87171', fontSize: 14 }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Restaurant Name
                </label>
                <input
                  id="signup-restaurant-name"
                  type="text"
                  value={restaurantName}
                  onChange={e => setRestaurantName(e.target.value)}
                  placeholder="Spice Garden"
                  required
                  className="input-base"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Contact Number
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                    borderRadius: 12, padding: '12px 14px', fontSize: 14,
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
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Email address
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
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Password
                </label>
                <input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
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
                style={{ marginTop: 6, fontSize: 16, width: '100%', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? (
                  <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span> Creating account…</>
                ) : 'Start Free Trial →'}
              </button>

              <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                By signing up you agree to our Terms of Service
              </p>
            </form>
          </div>

          <p style={{ textAlign: 'center', marginTop: 22, fontSize: 14, color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#ff6b35', fontWeight: 700, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) { .auth-left-panel { display: flex !important; } }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  )
}
