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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="shimmer" style={{ height: 80, borderRadius: 16 }} />
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', color: '#f0f0ff', margin: 0 }}>
              {restaurant?.name_en || 'Dashboard'}
            </h1>
            {liveOrderCount > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 20, padding: '3px 10px',
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite', display: 'inline-block' }} />
                <span style={{ fontSize: 12, color: '#f87171', fontWeight: 700 }}>{liveOrderCount} live</span>
              </div>
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}! Here&apos;s how you&apos;re doing today.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {restaurant && (
            <a href={menuUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
              <button className="btn-ghost" style={{ fontSize: 13 }}>
                <ExternalLink size={14} />
                Live Menu
              </button>
            </a>
          )}
          {restaurant?.slug && (
            <a href={`/kitchen/${restaurant.slug}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
              <button className="btn-ghost" style={{ fontSize: 13, color: '#4ade80', borderColor: 'rgba(34,197,94,0.2)', background: 'rgba(34,197,94,0.06)' }}>
                <Monitor size={14} />
                Kitchen Screen
              </button>
            </a>
          )}
        </div>
      </div>

      {/* ── Trial Banner ── */}
      {restaurant && !restaurant.subscription_active && (
        <div style={{
          background: 'linear-gradient(135deg,rgba(255,107,53,0.08),rgba(247,201,72,0.05))',
          border: '1px solid rgba(255,107,53,0.2)',
          borderRadius: 16, padding: '16px 22px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 22 }}>🎁</div>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#f0f0ff' }}>
                {trialDaysLeft} days left in your free trial
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
                Upgrade to keep all features after your trial
              </p>
            </div>
          </div>
          <Link href="/dashboard/billing" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <button className="btn-primary" style={{ padding: '9px 18px', fontSize: 13 }}>
              Upgrade — ₹499/mo →
            </button>
          </Link>
        </div>
      )}

      {/* ── Stats grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
        {[
          { label: 'Today\'s Views', value: todayViews, icon: Eye, color: '#6366f1', suffix: '', desc: 'Menu page opens' },
          { label: 'Today\'s Orders', value: todayOrders, icon: ShoppingBag, color: '#ff6b35', suffix: '', desc: 'Orders placed' },
          { label: 'Month Views', value: monthViews, icon: Eye, color: '#6366f1', suffix: '', desc: 'This calendar month' },
          { label: 'Month Orders', value: monthOrders, icon: ShoppingBag, color: '#ff6b35', suffix: '', desc: 'This calendar month' },
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 18, padding: '20px 22px',
            transition: 'border-color 0.2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{stat.label}</span>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: `${stat.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <stat.icon size={16} color={stat.color} />
              </div>
            </div>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#f0f0ff', letterSpacing: '-1px', lineHeight: 1 }}>
              {stat.value.toLocaleString('en-IN')}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 6 }}>{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* ── Savings + Commission saved ── */}
      <div style={{
        background: 'linear-gradient(135deg,rgba(34,197,94,0.05),rgba(34,197,94,0.02))',
        border: '1px solid rgba(34,197,94,0.12)',
        borderRadius: 18, padding: '22px 24px',
        display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <TrendingUp size={22} color="#4ade80" />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
            Estimated commission saved vs Swiggy/Zomato (25%)
          </p>
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em' }}>TODAY</span>
              <p style={{ fontSize: 22, fontWeight: 800, color: '#4ade80', margin: '2px 0 0', letterSpacing: '-0.5px' }}>
                ₹{estSaved(todayOrders).toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em' }}>THIS MONTH</span>
              <p style={{ fontSize: 22, fontWeight: 800, color: '#4ade80', margin: '2px 0 0', letterSpacing: '-0.5px' }}>
                ₹{estSaved(monthOrders).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.06em', marginBottom: 14 }}>
          QUICK ACTIONS
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 12 }}>

          <Link href="/dashboard/menu" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 16, padding: '22px 18px', cursor: 'pointer',
              transition: 'all 0.2s', textAlign: 'center',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,107,53,0.3)'
                ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'
                ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,107,53,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <PenLine size={20} color="#ff6b35" />
              </div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#f0f0ff' }}>Edit Menu</p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>Items & categories</p>
            </div>
          </Link>

          <Link href="/dashboard/tables" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 16, padding: '22px 18px', cursor: 'pointer',
              transition: 'all 0.2s', textAlign: 'center',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(99,102,241,0.3)'
                ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'
                ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <QrCode size={20} color="#818cf8" />
              </div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#f0f0ff' }}>QR Codes</p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>Download & print</p>
            </div>
          </Link>

          <Link href="/dashboard/orders" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 16, padding: '22px 18px', cursor: 'pointer',
              transition: 'all 0.2s', textAlign: 'center',
              position: 'relative',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,107,53,0.3)'
                ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'
                ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
              }}
            >
              {liveOrderCount > 0 && (
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  background: '#ef4444', color: 'white',
                  borderRadius: 20, padding: '1px 8px',
                  fontSize: 11, fontWeight: 800,
                }}>
                  {liveOrderCount}
                </div>
              )}
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <ShoppingBag size={20} color="#f87171" />
              </div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#f0f0ff' }}>Live Orders</p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>Manage & track</p>
            </div>
          </Link>

          {restaurant && (
            <div
              onClick={toggleOrdering}
              style={{
                background: restaurant.accept_orders
                  ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.05)',
                border: `1px solid ${restaurant.accept_orders ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                borderRadius: 16, padding: '22px 18px', cursor: 'pointer',
                transition: 'all 0.2s', textAlign: 'center',
                opacity: togglingOrders ? 0.6 : 1,
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: restaurant.accept_orders ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
              }}>
                {restaurant.accept_orders
                  ? <Play size={20} color="#4ade80" />
                  : <Pause size={20} color="#f87171" />}
              </div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#f0f0ff' }}>
                {restaurant.accept_orders ? '🟢 Orders ON' : '🔴 Orders Paused'}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
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
