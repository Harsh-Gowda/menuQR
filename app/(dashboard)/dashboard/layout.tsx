'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, UtensilsCrossed, QrCode,
  ShoppingBag, Settings, LogOut, Monitor, CreditCard, AlertTriangle
} from 'lucide-react'

const navItems = [
  { href: '/dashboard',          icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/menu',     icon: UtensilsCrossed, label: 'Menu' },
  { href: '/dashboard/tables',   icon: QrCode,          label: 'Tables' },
  { href: '/dashboard/orders',   icon: ShoppingBag,     label: 'Live Orders' },
  { href: '/dashboard/settings', icon: Settings,        label: 'Settings' },
  { href: '/dashboard/billing',  icon: CreditCard,      label: 'Billing' },
]

interface RestaurantInfo {
  slug: string
  name_en: string
  plan: string
  subscription_active: boolean
  subscription_ends_at: string | null
  is_developer_account: boolean
}

function daysRemaining(endsAt: string | null): number | null {
  if (!endsAt) return null
  return Math.ceil((new Date(endsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    async function fetchInfo() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('restaurants')
        .select('slug, name_en, plan, subscription_active, subscription_ends_at, is_developer_account')
        .eq('owner_user_id', user.id)
        .single()

      if (data) {
        setRestaurant(data)

        // ── Subscription guard ────────────────────────────────────────
        // Developer accounts: always allow
        if (data.is_developer_account) {
          setAuthChecked(true)
          return
        }

        // Paid accounts: check expiry
        const days = daysRemaining(data.subscription_ends_at)
        const isExpired = !data.subscription_active || (days !== null && days <= 0)

        if (isExpired && pathname !== '/dashboard/billing') {
          router.push('/dashboard/billing')
          return
        }
      } else {
        // No restaurant record — push to billing to pay
        router.push('/dashboard/billing')
        return
      }

      setAuthChecked(true)
    }
    fetchInfo()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!authChecked) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>🍽️</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, textTransform: 'uppercase', letterSpacing: '1px' }}>Loading…</p>
        </div>
      </div>
    )
  }

  const days = restaurant ? daysRemaining(restaurant.subscription_ends_at) : null
  const showExpiryBanner = restaurant
    && !restaurant.is_developer_account
    && days !== null
    && days > 0
    && days <= 5

  const currentPage = navItems.find(n => n.href === pathname || (n.href !== '/dashboard' && pathname.startsWith(n.href)))

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 280,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        padding: '32px 24px', position: 'sticky', top: 0, height: '100vh', zIndex: 30,
      }}>

        {/* Logo */}
        <Link href="/dashboard" style={{ textDecoration: 'none', marginBottom: 48, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'var(--brand-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 900, fontSize: 18,
            boxShadow: '0 0 20px rgba(225, 29, 72, 0.4)'
          }}>🍽️</div>
          <div>
            <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '1px', textTransform: 'uppercase' }}>MenuQR</p>
            {restaurant?.name_en && (
              <p style={{ fontSize: 12, color: 'var(--brand-primary)', margin: 0, fontWeight: 600, letterSpacing: '0.5px' }}>
                {restaurant.name_en.length > 18 ? restaurant.name_en.slice(0, 18) + '…' : restaurant.name_en}
              </p>
            )}
          </div>
        </Link>

        {/* Developer badge */}
        {restaurant?.is_developer_account && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)',
            borderRadius: 'var(--radius-md)', padding: '8px 12px', marginBottom: 24,
          }}>
            <span style={{ fontSize: 14 }}>👨‍💻</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Developer Mode
            </span>
          </div>
        )}

        {/* Nav items */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {navItems.map(item => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            const isBilling = item.href === '/dashboard/billing'
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '14px 20px', borderRadius: 'var(--radius-lg)',
                  background: isActive ? 'var(--brand-primary-light)' : 'transparent',
                  color: isActive ? 'var(--brand-primary)' : isBilling ? 'var(--text-muted)' : 'var(--text-secondary)',
                  borderLeft: isActive ? '3px solid var(--brand-primary)' : '3px solid transparent',
                  fontSize: 15, fontWeight: isActive ? 700 : 600,
                  transition: 'all 0.2s', cursor: 'pointer',
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-primary)' } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = isBilling ? 'var(--text-muted)' : 'var(--text-secondary)' } }}
                >
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  {item.label}
                  {/* Expiry warning dot on billing */}
                  {isBilling && showExpiryBanner && (
                    <span style={{
                      marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%',
                      background: '#f59e0b', flexShrink: 0,
                    }} />
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {restaurant?.slug && (
            <a href={`/kitchen/${restaurant.slug}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 20px', borderRadius: 'var(--radius-lg)',
                background: 'var(--brand-success-light)', color: 'var(--brand-success)',
                fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px',
                transition: 'all 0.2s', cursor: 'pointer', border: '1px solid rgba(22, 163, 74, 0.3)'
              }}>
                <Monitor size={18} />
                Kitchen Screen
              </div>
            </a>
          )}

          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 20px', borderRadius: 'var(--radius-lg)',
              background: 'transparent', border: 'none',
              color: 'var(--text-muted)', fontSize: 15, cursor: 'pointer',
              width: '100%', transition: 'all 0.2s', fontWeight: 600, fontFamily: 'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}>

        {/* Expiry warning banner */}
        {showExpiryBanner && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)', borderBottom: '1px solid rgba(245, 158, 11, 0.3)',
            padding: '12px 48px', display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <AlertTriangle size={16} color="#f59e0b" />
            <span style={{ color: '#f59e0b', fontSize: 13, fontWeight: 700 }}>
              Your subscription expires in {days} day{days === 1 ? '' : 's'}.
            </span>
            <Link href="/dashboard/billing" style={{ color: '#f59e0b', fontSize: 13, fontWeight: 800, textDecoration: 'underline', marginLeft: 8 }}>
              Renew now →
            </Link>
          </div>
        )}

        {/* Header */}
        <div style={{
          height: 100, display: 'flex', alignItems: 'center',
          padding: '0 48px', position: 'sticky', top: 0, zIndex: 20,
          gap: 12, background: 'rgba(17, 17, 17, 0.8)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)'
        }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 14, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Dashboard</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>/</span>
          <span style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
            {currentPage?.label || 'Overview'}
          </span>
        </div>

        <div style={{ padding: '48px', maxWidth: 1400, flex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  )
}
