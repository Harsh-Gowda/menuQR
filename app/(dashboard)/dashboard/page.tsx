'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Restaurant } from '@/types'
import { Eye, ShoppingBag, TrendingUp, QrCode, PenLine, Pause, Play, ExternalLink, Monitor } from 'lucide-react'

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
  const estSaved = (orders: number) => Math.round(orders * 350 * 0.25)

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="shimmer" style={{ height: 100, borderRadius: 'var(--radius-lg)' }} />
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyItems: 'space-between', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text-primary)', margin: 0 }}>
              {restaurant?.name_en || 'Dashboard'}
            </h1>
            {liveOrderCount > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#fef2f2', border: '1px solid #fca5a5',
                borderRadius: 100, padding: '4px 12px',
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite', display: 'inline-block' }} />
                <span style={{ fontSize: 13, color: '#b91c1c', fontWeight: 600 }}>{liveOrderCount} live</span>
              </div>
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, margin: 0 }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}! Here's your restaurant activity.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          {restaurant && (
            <a href={menuUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
              <button className="btn-secondary" style={{ fontSize: 14, padding: '10px 16px' }}>
                <ExternalLink size={16} />
                Live Menu
              </button>
            </a>
          )}
          {restaurant?.slug && (
            <a href={`/kitchen/${restaurant.slug}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
              <button className="btn-secondary" style={{ fontSize: 14, padding: '10px 16px', color: '#166534', borderColor: '#bbf7d0', background: '#f0fdf4' }}>
                <Monitor size={16} />
                Kitchen Screen
              </button>
            </a>
          )}
        </div>
      </div>

      {/* ── Trial Banner ── */}
      {restaurant && !restaurant.subscription_active && (
        <div style={{
          background: 'var(--brand-primary-light)',
          border: '1px solid rgba(37,99,235,0.2)',
          borderRadius: 'var(--radius-lg)', padding: '20px 24px',
          display: 'flex', alignItems: 'center', justifyItems: 'space-between', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 24 }}>🚀</div>
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--brand-primary)' }}>
                {trialDaysLeft} days left in your free trial
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>
                Upgrade to keep all features running after your trial ends.
              </p>
            </div>
          </div>
          <Link href="/dashboard/billing" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <button className="btn-primary" style={{ padding: '10px 20px', fontSize: 14 }}>
              Upgrade — ₹499/mo
            </button>
          </Link>
        </div>
      )}

      {/* ── Stats grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20 }}>
        {[
          { label: 'Today\'s Views', value: todayViews, icon: Eye, color: 'var(--brand-primary)', bg: 'var(--brand-primary-light)', desc: 'Menu page opens' },
          { label: 'Today\'s Orders', value: todayOrders, icon: ShoppingBag, color: '#ea580c', bg: '#ffedd5', desc: 'Orders placed' },
          { label: 'Month Views', value: monthViews, icon: Eye, color: 'var(--brand-primary)', bg: 'var(--brand-primary-light)', desc: 'This calendar month' },
          { label: 'Month Orders', value: monthOrders, icon: ShoppingBag, color: '#ea580c', bg: '#ffedd5', desc: 'This calendar month' },
        ].map((stat, i) => (
          <div key={i} className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600 }}>{stat.label}</span>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <stat.icon size={18} color={stat.color} />
              </div>
            </div>
            <div style={{ fontSize: 40, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px', lineHeight: 1 }}>
              {stat.value.toLocaleString('en-IN')}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 8, margin: '8px 0 0' }}>{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* ── Savings + Commission saved ── */}
      <div className="card" style={{
        background: '#f0fdf4', border: '1px solid #bbf7d0',
        padding: '24px 32px', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: '#dcfce7', border: '1px solid #bbf7d0',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <TrendingUp size={28} color="#166534" />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 500 }}>
            Estimated commission saved vs Swiggy/Zomato (25%)
          </p>
          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>TODAY</span>
              <p style={{ fontSize: 28, fontWeight: 800, color: '#166534', margin: '4px 0 0', letterSpacing: '-0.5px' }}>
                ₹{estSaved(todayOrders).toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>THIS MONTH</span>
              <p style={{ fontSize: 28, fontWeight: 800, color: '#166534', margin: '4px 0 0', letterSpacing: '-0.5px' }}>
                ₹{estSaved(monthOrders).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
          Quick Actions
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16 }}>

          <Link href="/dashboard/menu" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ padding: '24px 20px', textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--brand-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <PenLine size={24} color="var(--brand-primary)" />
              </div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Edit Menu</p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>Items & categories</p>
            </div>
          </Link>

          <Link href="/dashboard/tables" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ padding: '24px 20px', textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <QrCode size={24} color="#9333ea" />
              </div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>QR Codes</p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>Download & print</p>
            </div>
          </Link>

          <Link href="/dashboard/orders" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ padding: '24px 20px', textAlign: 'center', cursor: 'pointer', position: 'relative' }}>
              {liveOrderCount > 0 && (
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  background: '#ef4444', color: 'white',
                  borderRadius: 20, padding: '2px 10px',
                  fontSize: 12, fontWeight: 700,
                }}>
                  {liveOrderCount}
                </div>
              )}
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <ShoppingBag size={24} color="#ef4444" />
              </div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Live Orders</p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>Manage & track</p>
            </div>
          </Link>

          {restaurant && (
            <div
              className="card"
              onClick={toggleOrdering}
              style={{
                background: restaurant.accept_orders ? '#ffffff' : '#fef2f2',
                border: `1px solid ${restaurant.accept_orders ? 'var(--border)' : '#fca5a5'}`,
                padding: '24px 20px', textAlign: 'center', cursor: 'pointer',
                opacity: togglingOrders ? 0.6 : 1,
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: restaurant.accept_orders ? '#dcfce7' : '#fef2f2',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
              }}>
                {restaurant.accept_orders
                  ? <Play size={24} color="#166534" />
                  : <Pause size={24} color="#ef4444" />}
              </div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                {restaurant.accept_orders ? '🟢 Orders ON' : '🔴 Orders Paused'}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
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
