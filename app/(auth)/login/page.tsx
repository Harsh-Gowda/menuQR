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
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/dashboard')
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--bg-base)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Glow orbs */}
      <div className="glow-orb" style={{ width: 500, height: 500, background: 'rgba(255,107,53,0.1)', top: -150, left: -150 }} />
      <div className="glow-orb" style={{ width: 400, height: 400, background: 'rgba(99,102,241,0.07)', bottom: -100, right: -100 }} />

      {/* Left panel — branding */}
      <div style={{
        display: 'none',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px',
        background: 'linear-gradient(135deg,rgba(255,107,53,0.05) 0%,transparent 100%)',
        borderRight: '1px solid var(--border)',
        position: 'relative',
      }} className="auth-left-panel">
        <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 60 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg,#ff6b35,#f7c948)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
          }}>🍽️</div>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#f0f0ff' }}>Menu<span style={{ color: '#ff6b35' }}>QR</span></span>
        </Link>
        <h2 style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-1.5px', color: '#f0f0ff', lineHeight: 1.15, marginBottom: 20 }}>
          Your restaurant,<br /><span className="gradient-text">fully digital.</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 17, lineHeight: 1.7 }}>
          Manage your menu, track orders live, and serve customers faster — all from one beautiful dashboard.
        </p>
      </div>

      {/* Right panel — form */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', position: 'relative', zIndex: 1,
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Mobile logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48, justifyContent: 'center' }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11,
              background: 'linear-gradient(135deg,#ff6b35,#f7c948)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
            }}>🍽️</div>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#f0f0ff' }}>Menu<span style={{ color: '#ff6b35' }}>QR</span></span>
          </Link>

          <div style={{
            background: 'rgba(15,15,26,0.6)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 24,
            padding: '40px 36px',
            backdropFilter: 'blur(20px)',
          }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6, color: '#f0f0ff' }}>
              Welcome back
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 32 }}>
              Sign in to your restaurant dashboard
            </p>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 12, padding: '12px 16px', marginBottom: 24,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 16 }}>⚠️</span>
                <span style={{ color: '#f87171', fontSize: 14 }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
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
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Password</label>
                </div>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-base"
                />
              </div>

              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', marginTop: 4, opacity: loading ? 0.7 : 1, fontSize: 16 }}
              >
                {loading ? (
                  <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span> Signing in…</>
                ) : 'Sign In →'}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-muted)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" style={{ color: '#ff6b35', fontWeight: 700, textDecoration: 'none' }}>
              Start free trial
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .auth-left-panel { display: flex !important; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
