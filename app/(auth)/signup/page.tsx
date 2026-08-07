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

    // 1. Call server-side signup API (uses service role key to bypass RLS)
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

    // 2. Sign in immediately (email is auto-confirmed server-side)
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
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'var(--bg-base)', padding: 24,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>You&apos;re all set!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: 'var(--bg-base)',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg, #ff6b35, #f7c948)',
              borderRadius: 12, padding: '8px 16px',
            }}>
              <span style={{ fontSize: 20 }}>🍽️</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>MenuQR.in</span>
            </div>
          </Link>
          <p style={{ marginTop: 12, color: 'var(--text-secondary)', fontSize: 14 }}>
            14-day free trial · No credit card needed
          </p>
        </div>

        <form onSubmit={handleSignup} style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 20, padding: 32,
        }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Create your account</h1>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 14, color: '#ef4444',
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Restaurant Name *
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
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                WhatsApp Number * <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>(orders go here)</span>
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{
                  background: 'var(--bg-base)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '10px 14px', fontSize: 15,
                  color: 'var(--text-secondary)', whiteSpace: 'nowrap',
                }}>
                  +91
                </div>
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
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Email *
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
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Password *
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
              style={{ marginTop: 8, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Creating account...' : 'Start Free Trial →'}
            </button>

            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
              By signing up you agree to our Terms of Service
            </p>
          </div>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#ff6b35', fontWeight: 600, textDecoration: 'none' }}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  )
}
