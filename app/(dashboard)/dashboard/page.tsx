'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Restaurant } from '@/types'
import { Eye, MessageCircle, TrendingUp, QrCode, PenLine, Play, Pause, ExternalLink } from 'lucide-react'

export default function DashboardPage() {
  const supabase = createClient()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [todayViews, setTodayViews] = useState(0)
  const [todayOrders, setTodayOrders] = useState(0)
  const [monthViews, setMonthViews] = useState(0)
  const [monthOrders, setMonthOrders] = useState(0)
  const [loading, setLoading] = useState(true)
  const [togglingOrders, setTogglingOrders] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: rest } = await supabase
      .from('restaurants')
      .select('*')
      .eq('owner_user_id', user.id)
      .single()

    if (!rest) { setLoading(false); return }
    setRestaurant(rest)

    const today = new Date().toISOString().split('T')[0]
    const monthStart = today.slice(0, 7) + '-01'

    const [tv, to, mv, mo] = await Promise.all([
      supabase.from('menu_views').select('id', { count: 'exact' })
        .eq('restaurant_id', rest.id).gte('viewed_at', today),
      supabase.from('order_logs').select('id', { count: 'exact' })
        .eq('restaurant_id', rest.id).gte('created_at', today),
      supabase.from('menu_views').select('id', { count: 'exact' })
        .eq('restaurant_id', rest.id).gte('viewed_at', monthStart),
      supabase.from('order_logs').select('id', { count: 'exact' })
        .eq('restaurant_id', rest.id).gte('created_at', monthStart),
    ])

    setTodayViews(tv.count || 0)
    setTodayOrders(to.count || 0)
    setMonthViews(mv.count || 0)
    setMonthOrders(mo.count || 0)
    setLoading(false)
  }

  async function toggleOrdering() {
    if (!restaurant) return
    setTogglingOrders(true)
    const { data } = await supabase
      .from('restaurants')
      .update({ accept_orders: !restaurant.accept_orders })
      .eq('id', restaurant.id)
      .select()
      .single()
    if (data) setRestaurant(data as Restaurant)
    setTogglingOrders(false)
  }

  // Estimated savings vs Swiggy 25% commission
  function estSaved(orders: number, avgOrderValue = 350) {
    return Math.round(orders * avgOrderValue * 0.25)
  }

  const menuUrl = `${process.env.NEXT_PUBLIC_MENU_BASE_URL || 'http://localhost:3000'}/menu/${restaurant?.slug}`
  const trialDaysLeft = restaurant
    ? Math.max(0, Math.ceil((new Date(restaurant.trial_ends_at).getTime() - Date.now()) / 86400000))
    : 0

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px' }}>
            {restaurant?.name_en || 'Dashboard'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>
            Welcome back! Here&apos;s how your menu is performing.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {restaurant && (
            <a href={menuUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
              <button className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                <ExternalLink size={14} />
                View Live Menu
              </button>
            </a>
          )}
        </div>
      </div>

      {/* Trial banner */}
      {restaurant && !restaurant.subscription_active && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,107,53,0.1), rgba(247,201,72,0.08))',
          border: '1px solid rgba(255,107,53,0.25)',
          borderRadius: 14, padding: '14px 20px', marginBottom: 28,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
        }}>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-primary)' }}>
            🎉 You have <strong style={{ color: '#ff6b35' }}>{trialDaysLeft} days</strong> left in your free trial.
          </p>
          <Link href="/dashboard/billing" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
              Upgrade — ₹499/mo →
            </button>
          </Link>
        </div>
      )}

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Today — Views', value: todayViews, icon: Eye, color: '#60a5fa' },
          { label: 'Today — WA Orders', value: todayOrders, icon: MessageCircle, color: '#25d366' },
          { label: 'This Month — Views', value: monthViews, icon: Eye, color: '#60a5fa' },
          { label: 'This Month — Orders', value: monthOrders, icon: MessageCircle, color: '#25d366' },
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 16, padding: '20px 22px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <stat.icon size={16} color={stat.color} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{stat.label}</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Savings card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(37,211,102,0.06), rgba(37,211,102,0.02))',
        border: '1px solid rgba(37,211,102,0.15)',
        borderRadius: 16, padding: '20px 22px', marginBottom: 28,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <TrendingUp size={28} color="#25d366" />
        <div>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>Estimated savings vs Swiggy/Zomato (25% commission)</p>
          <div style={{ display: 'flex', gap: 24, marginTop: 6 }}>
            <div>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Today: </span>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#25d366' }}>
                ₹{estSaved(todayOrders).toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>This month: </span>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#25d366' }}>
                ₹{estSaved(monthOrders).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Quick Actions</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 28 }}>
        <Link href="/dashboard/menu" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 14, padding: '18px 16px', cursor: 'pointer',
            transition: 'border-color 0.15s', textAlign: 'center',
          }}>
            <PenLine size={22} color="#ff6b35" style={{ marginBottom: 8 }} />
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Update Menu</p>
          </div>
        </Link>
        <Link href="/dashboard/tables" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 14, padding: '18px 16px', cursor: 'pointer', textAlign: 'center',
          }}>
            <QrCode size={22} color="#60a5fa" style={{ marginBottom: 8 }} />
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Download QR Codes</p>
          </div>
        </Link>
        {restaurant && (
          <div
            onClick={toggleOrdering}
            style={{
              background: 'var(--bg-card)', border: `1px solid ${restaurant.accept_orders ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
              borderRadius: 14, padding: '18px 16px', cursor: 'pointer', textAlign: 'center',
              opacity: togglingOrders ? 0.7 : 1,
            }}
          >
            {restaurant.accept_orders
              ? <Play size={22} color="#22c55e" style={{ marginBottom: 8 }} />
              : <Pause size={22} color="#ef4444" style={{ marginBottom: 8 }} />
            }
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
              {restaurant.accept_orders ? '🟢 Ordering is ON' : '🔴 Ordering PAUSED'}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
              Click to {restaurant.accept_orders ? 'pause' : 'resume'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
