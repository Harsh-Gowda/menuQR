'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', padding: 24, position: 'relative'
    }}>
      {/* Background Glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 500, height: 500, background: 'radial-gradient(circle, rgba(225, 29, 72, 0.08) 0%, rgba(17,17,17,0) 70%)', zIndex: 0 }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 40 }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(225,29,72,0.12)',
            border: '1.5px solid rgba(225,29,72,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
          }}>🍽️</div>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            MenuQ
          </span>
        </Link>

        {/* Card */}
        <div className="card animate-scale-in" style={{ padding: '48px 40px', background: 'var(--bg-surface)' }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12, color: 'var(--text-primary)', textAlign: 'center' }}>
            Welcome Back
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 40, textAlign: 'center' }}>
            Sign in to manage your restaurant
          </p>

          {error && (
            <div style={{
              background: 'rgba(225, 29, 72, 0.1)', border: '1px solid var(--brand-primary)',
              borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: 24,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ color: 'var(--brand-primary)' }}>⚠️</span>
              <span style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 600 }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@restaurant.com"
                required
                className="input-base"
                style={{ background: 'var(--bg-base)' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Password
                </label>
                <Link href="#" style={{ fontSize: 12, color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Forgot?
                </Link>
              </div>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="input-base"
                style={{ background: 'var(--bg-base)' }}
              />
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ marginTop: 8, width: '100%', opacity: loading ? 0.7 : 1, textTransform: 'uppercase', letterSpacing: '1px' }}
            >
              {loading ? (
                <><span className="animate-spin" style={{ display: 'inline-block' }}>⏳</span> Signing in…</>
              ) : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="animate-slide-up" style={{ textAlign: 'center', marginTop: 32, fontSize: 14, color: 'var(--text-secondary)', animationDelay: '0.1s' }}>
          Don't have an account?{' '}
          <Link href="/signup" style={{ color: 'var(--brand-primary)', fontWeight: 700, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Get Started
          </Link>
        </p>
      </div>
    </div>
  )
}
