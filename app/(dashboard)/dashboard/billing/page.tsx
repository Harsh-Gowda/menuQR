'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const PaymentModal = dynamic(() => import('@/components/PaymentModal'), { ssr: false })

interface Restaurant {
  id: string
  name_en: string
  plan: string
  subscription_active: boolean
  subscription_ends_at: string | null
  subscription_started_at: string | null
  is_developer_account: boolean
}

interface PaymentLog {
  id: string
  amount_inr: number
  status: string
  payment_type: string
  razorpay_payment_id: string | null
  created_at: string
}

function daysRemaining(endsAt: string | null): number | null {
  if (!endsAt) return null
  const diff = new Date(endsAt).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

export default function BillingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [paymentLogs, setPaymentLogs] = useState<PaymentLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showPayment, setShowPayment] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserEmail(user.email || '')

      const { data: rest } = await supabase
        .from('restaurants')
        .select('id, name_en, plan, subscription_active, subscription_ends_at, subscription_started_at, is_developer_account')
        .eq('owner_user_id', user.id)
        .single()

      if (rest) setRestaurant(rest)

      if (rest?.id) {
        const { data: logs } = await supabase
          .from('payment_logs')
          .select('id, amount_inr, status, payment_type, razorpay_payment_id, created_at')
          .eq('restaurant_id', rest.id)
          .order('created_at', { ascending: false })
          .limit(10)
        if (logs) setPaymentLogs(logs)
      }

      setLoading(false)
    }
    load()
  }, [supabase, router])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>Loading billing info…</p>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Restaurant not found. <Link href="/dashboard" style={{ color: 'var(--brand-primary)' }}>Go back</Link></p>
      </div>
    )
  }

  const days = daysRemaining(restaurant.subscription_ends_at)
  const isExpired = !restaurant.is_developer_account && (days !== null && days <= 0)
  const isExpiringSoon = !restaurant.is_developer_account && (days !== null && days > 0 && days <= 5)
  const isDeveloper = restaurant.is_developer_account

  const statusColor = isDeveloper
    ? '#16a34a'
    : isExpired ? '#E11D48'
    : isExpiringSoon ? '#f59e0b'
    : '#16a34a'

  const statusLabel = isDeveloper
    ? 'Developer — Lifetime Free'
    : isExpired ? 'Expired'
    : isExpiringSoon ? `Expires in ${days} day${days === 1 ? '' : 's'}`
    : restaurant.subscription_active ? `Active · ${days} days remaining`
    : 'Inactive'

  return (
    <div style={{ maxWidth: 800 }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8, color: 'var(--text-primary)' }}>
        Billing & Subscription
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 48 }}>
        Manage your MenuQR subscription and payment history.
      </p>

      {/* Status Card */}
      <div style={{
        background: 'var(--bg-surface)', border: `1px solid ${statusColor}33`,
        borderRadius: 'var(--radius-xl)', padding: '32px 36px', marginBottom: 32,
        display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ flex: '1 1 300px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: `${statusColor}15`, border: `1px solid ${statusColor}40`,
            borderRadius: '100px', padding: '5px 14px', marginBottom: 20,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: statusColor, display: 'inline-block' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: statusColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {statusLabel}
            </span>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, color: 'var(--text-primary)' }}>
            MenuQR Pro
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '0 0 4px' }}>
            {isDeveloper
              ? 'Developer account — no payment required'
              : `₹499 / month · Renews manually`}
          </p>
          {!isDeveloper && restaurant.subscription_ends_at && (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              {isExpired ? 'Expired on ' : 'Next renewal: '}
              <strong>{formatDate(restaurant.subscription_ends_at)}</strong>
            </p>
          )}
          {!isDeveloper && restaurant.subscription_started_at && (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
              Member since: <strong>{formatDate(restaurant.subscription_started_at)}</strong>
            </p>
          )}
        </div>

        {!isDeveloper && (
          <div style={{ flexShrink: 0 }}>
            {isExpired ? (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#E11D48', fontSize: 13, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase' }}>
                  Access suspended
                </p>
                <button
                  onClick={() => setShowPayment(true)}
                  className="btn-primary"
                  style={{ padding: '14px 28px', boxShadow: '0 8px 24px rgba(225,29,72,0.3)' }}
                >
                  Reactivate — ₹499
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowPayment(true)}
                style={{
                  background: 'transparent', border: '1.5px solid var(--border)',
                  color: 'var(--text-primary)', borderRadius: 'var(--radius-pill)',
                  padding: '14px 28px', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit',
                  textTransform: 'uppercase', letterSpacing: '1px',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand-primary)'; e.currentTarget.style.color = 'var(--brand-primary)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)' }}
              >
                Renew Early
              </button>
            )}
          </div>
        )}
      </div>

      {/* What's Included */}
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)', padding: '32px 36px', marginBottom: 32,
      }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 24, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Your Plan Includes
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {[
            { icon: '🍽️', label: 'Unlimited Menu Items' },
            { icon: '📱', label: 'QR Code Ordering' },
            { icon: '👨‍🍳', label: 'Live Kitchen Display' },
            { icon: '📊', label: 'Analytics Dashboard' },
            { icon: '🌐', label: 'Multilingual Menu' },
            { icon: '🔒', label: 'Secure Hosting' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600 }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment History */}
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)', padding: '32px 36px',
      }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 24, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Payment History
        </h3>

        {paymentLogs.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No payment records found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {paymentLogs.map(log => (
              <div key={log.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px 20px', background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                flexWrap: 'wrap', gap: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 18 }}>{log.payment_type === 'signup' ? '🎉' : '🔄'}</span>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', margin: '0 0 2px', textTransform: 'capitalize' }}>
                      {log.payment_type === 'signup' ? 'Account Activation' : 'Subscription Renewal'}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                      {formatDate(log.created_at)}
                      {log.razorpay_payment_id && ` · ${log.razorpay_payment_id}`}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
                    ₹{log.amount_inr}
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '4px 10px',
                    borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.5px',
                    background: log.status === 'success' ? 'rgba(22,163,74,0.1)' : 'rgba(225,29,72,0.1)',
                    color: log.status === 'success' ? '#16a34a' : '#E11D48',
                    border: `1px solid ${log.status === 'success' ? 'rgba(22,163,74,0.3)' : 'rgba(225,29,72,0.3)'}`,
                  }}>
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Renewal Payment Modal */}
      {showPayment && (
        <PaymentModal
          signupData={{ email: userEmail, password: '', restaurantName: restaurant.name_en, whatsapp: '' }}
          onClose={() => setShowPayment(false)}
          renewalMode={true}
        />
      )}
    </div>
  )
}
