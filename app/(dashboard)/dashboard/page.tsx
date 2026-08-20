'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Restaurant } from '@/types'
import { Eye, ShoppingBag, QrCode, PenLine, Pause, Play, ExternalLink } from 'lucide-react'

export default function DashboardPage() {
  const supabase = createClient()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [todayViews, setTodayViews] = useState(0)
  const [todayOrders, setTodayOrders] = useState(0)
  const [monthViews, setMonthViews] = useState(0)
  const [monthOrders, setMonthOrders] = useState(0)
  const [loading, setLoading] = useState(true)
  const [togglingOrders, setTogglingOrders] = useState(false)
  const [liveOrderCount, setLiveOrderCount] = useState(0)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: rest } = await supabase
      .from('restaurants').select('*').eq('owner_user_id', user.id).single()

    if (!rest) { setLoading(false); return }
    setRestaurant(rest)

    const today = new Date().toISOString().split('T')[0]
    const monthStart = today.slice(0, 7) + '-01'

    const [tv, to, mv, mo, lo] = await Promise.all([
      supabase.from('menu_views').select('id', { count: 'exact' }).eq('restaurant_id', rest.id).gte('viewed_at', today),
      supabase.from('order_logs').select('id', { count: 'exact' }).eq('restaurant_id', rest.id).gte('created_at', today),
      supabase.from('menu_views').select('id', { count: 'exact' }).eq('restaurant_id', rest.id).gte('viewed_at', monthStart),
      supabase.from('order_logs').select('id', { count: 'exact' }).eq('restaurant_id', rest.id).gte('created_at', monthStart),
      supabase.from('orders').select('id', { count: 'exact' }).eq('restaurant_id', rest.id).neq('status', 'done'),
    ])

    setTodayViews(tv.count || 0)
    setTodayOrders(to.count || 0)
    setMonthViews(mv.count || 0)
    setMonthOrders(mo.count || 0)
    setLiveOrderCount(lo.count || 0)
    setLoading(false)
  }

  async function toggleOrdering() {
    if (!restaurant) return
    setTogglingOrders(true)
    const { data } = await supabase
      .from('restaurants').update({ accept_orders: !restaurant.accept_orders })
      .eq('id', restaurant.id).select().single()
    if (data) setRestaurant(data as Restaurant)
    setTogglingOrders(false)
  }

  const menuUrl = `${process.env.NEXT_PUBLIC_MENU_BASE_URL || 'http://localhost:3000'}/menu/${restaurant?.slug}`
  const trialDaysLeft = restaurant
    ? Math.max(0, Math.ceil((new Date(restaurant.trial_ends_at).getTime() - Date.now()) / 86400000))
    : 0

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="shimmer" style={{ height: 120, borderRadius: 'var(--radius-xl)' }} />
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }} className="animate-slide-up">

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <h1 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              {restaurant?.name_en || 'Dashboard'}
            </h1>
            {liveOrderCount > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(225, 29, 72, 0.15)', border: '1px solid var(--brand-primary)',
                borderRadius: 100, padding: '6px 16px',
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-primary)', animation: 'pulse 1.5s infinite', display: 'inline-block' }} />
                <span style={{ fontSize: 13, color: 'var(--brand-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>{liveOrderCount} Live Orders</span>
              </div>
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, margin: 0, fontWeight: 400, letterSpacing: '0.5px' }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}! Let's check your restaurant performance.
          </p>
        </div>

        {restaurant && (
          <a href={menuUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
            <button className="btn-secondary" style={{ padding: '12px 24px', fontSize: 14, textTransform: 'uppercase', letterSpacing: '1px' }}>
              View Live Menu <ExternalLink size={16} />
            </button>
          </a>
        )}
      </div>

      {/* ── Trial Banner ── */}
      {restaurant && !restaurant.subscription_active && (
        <div className="card" style={{
          background: 'linear-gradient(135deg, var(--brand-primary) 0%, #9F1239 100%)', color: 'white',
          padding: '32px 40px', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap',
          boxShadow: '0 20px 40px rgba(225, 29, 72, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ fontSize: 40, background: 'rgba(255,255,255,0.2)', padding: 16, borderRadius: '50%' }}>🚀</div>
            <div>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>
                {trialDaysLeft} days left in your free trial
              </p>
              <p style={{ margin: '8px 0 0', fontSize: 15, fontWeight: 500, opacity: 0.9 }}>
                Upgrade your account to keep taking orders without interruption.
              </p>
            </div>
          </div>
          <Link href="/dashboard/billing" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <button style={{
              background: 'white', color: '#9F1239', border: 'none',
              borderRadius: 100, padding: '16px 32px', fontWeight: 800, fontSize: 14, textTransform: 'uppercase', letterSpacing: '1px',
              cursor: 'pointer', transition: 'transform 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              Upgrade Now
            </button>
          </Link>
        </div>
      )}

      {/* ── Stats grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 24 }}>
        {[
          { label: 'Today\'s Views', value: todayViews, icon: Eye, color: 'var(--brand-primary)', bg: 'var(--brand-primary-light)' },
          { label: 'Today\'s Orders', value: todayOrders, icon: ShoppingBag, color: 'var(--brand-success)', bg: 'var(--brand-success-light)' },
          { label: 'Month Views', value: monthViews, icon: Eye, color: 'var(--text-secondary)', bg: 'var(--border)' },
          { label: 'Month Orders', value: monthOrders, icon: ShoppingBag, color: 'var(--brand-success)', bg: 'var(--brand-success-light)' },
        ].map((stat, i) => (
          <div key={i} className="card" style={{ padding: '32px', background: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <stat.icon size={24} color={stat.color} />
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</span>
            </div>
            <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>
              {stat.value.toLocaleString('en-IN')}
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24, textTransform: 'uppercase', letterSpacing: '1px' }}>
          Quick Actions
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 24 }}>

          <Link href="/dashboard/menu" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ padding: '40px 24px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg-surface)' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid var(--border)' }}>
                <PenLine size={28} color="var(--text-primary)" />
              </div>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Edit Menu</p>
              <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>Update dishes & prices</p>
            </div>
          </Link>

          <Link href="/dashboard/tables" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ padding: '40px 24px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg-surface)' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid var(--border)' }}>
                <QrCode size={28} color="var(--text-primary)" />
              </div>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>QR Codes</p>
              <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>Download for tables</p>
            </div>
          </Link>

          <Link href="/dashboard/orders" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ padding: '40px 24px', textAlign: 'center', cursor: 'pointer', position: 'relative', background: 'var(--bg-surface)' }}>
              {liveOrderCount > 0 && (
                <div style={{
                  position: 'absolute', top: 20, right: 20,
                  background: 'var(--brand-primary)', color: 'white',
                  borderRadius: 100, padding: '4px 12px',
                  fontSize: 12, fontWeight: 800,
                }}>
                  {liveOrderCount} NEW
                </div>
              )}
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--brand-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid rgba(225, 29, 72, 0.3)' }}>
                <ShoppingBag size={28} color="var(--brand-primary)" />
              </div>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Live Orders</p>
              <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>View incoming orders</p>
            </div>
          </Link>

          {restaurant && (
            <div
              className="card"
              onClick={toggleOrdering}
              style={{
                background: restaurant.accept_orders ? 'var(--bg-surface)' : 'rgba(225, 29, 72, 0.05)',
                border: `1px solid ${restaurant.accept_orders ? 'var(--border)' : 'var(--brand-primary)'}`,
                padding: '40px 24px', textAlign: 'center', cursor: 'pointer',
                opacity: togglingOrders ? 0.6 : 1,
              }}
            >
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: restaurant.accept_orders ? 'var(--brand-success-light)' : 'var(--brand-primary-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
                border: `1px solid ${restaurant.accept_orders ? 'rgba(22, 163, 74, 0.3)' : 'rgba(225, 29, 72, 0.3)'}`
              }}>
                {restaurant.accept_orders
                  ? <Play size={28} color="var(--brand-success)" />
                  : <Pause size={28} color="var(--brand-primary)" />}
              </div>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: restaurant.accept_orders ? 'var(--brand-success)' : 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {restaurant.accept_orders ? 'Orders Open' : 'Orders Paused'}
              </p>
              <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
                Tap to {restaurant.accept_orders ? 'pause' : 'resume'}
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%,100%{opacity:1;transform:scale(1)}
          50%{opacity:0.6;transform:scale(0.95)}
        }
      `}</style>
    </div>
  )
}
