'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, UtensilsCrossed, QrCode,
  ShoppingBag, Settings, LogOut, Monitor, ChevronRight,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard',          icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/menu',     icon: UtensilsCrossed, label: 'Menu' },
  { href: '/dashboard/tables',   icon: QrCode,          label: 'Tables & QR' },
  { href: '/dashboard/orders',   icon: ShoppingBag,     label: 'Live Orders' },
  { href: '/dashboard/settings', icon: Settings,        label: 'Settings' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [restaurantSlug, setRestaurantSlug] = useState('')
  const [restaurantName, setRestaurantName] = useState('')

  useEffect(() => {
    async function fetchInfo() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('restaurants')
        .select('slug, name_en')
        .eq('owner_user_id', user.id)
        .single()
      if (data) { setRestaurantSlug(data.slug); setRestaurantName(data.name_en) }
    }
    fetchInfo()
  }, [supabase])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const currentPage = navItems.find(n => n.href === pathname || (n.href !== '/dashboard' && pathname.startsWith(n.href)))

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 232,
        flexShrink: 0,
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 12px',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 30,
      }}>

        {/* Logo */}
        <Link href="/dashboard" style={{ textDecoration: 'none', marginBottom: 28 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 14,
            background: 'linear-gradient(135deg,rgba(255,107,53,0.12),rgba(247,201,72,0.06))',
            border: '1px solid rgba(255,107,53,0.18)',
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'linear-gradient(135deg,#ff6b35,#f7c948)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
            }}>🍽️</div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 800, color: '#f0f0ff', margin: 0, letterSpacing: '-0.3px' }}>MenuQR</p>
              {restaurantName && (
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>
                  {restaurantName.length > 16 ? restaurantName.slice(0, 16) + '…' : restaurantName}
                </p>
              )}
            </div>
          </div>
        </Link>

        {/* Nav label */}
        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: 'var(--text-muted)', padding: '0 12px', marginBottom: 8 }}>
          MENU
        </p>

        {/* Nav items */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(item => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', borderRadius: 11,
                  background: isActive ? 'rgba(255,107,53,0.1)' : 'transparent',
                  color: isActive ? '#ff7a4a' : 'var(--text-secondary)',
                  fontSize: 14, fontWeight: isActive ? 700 : 500,
                  transition: 'all 0.15s', cursor: 'pointer',
                  position: 'relative',
                }}>
                  {isActive && (
                    <div style={{
                      position: 'absolute', left: 0, top: '20%', bottom: '20%',
                      width: 3, borderRadius: 4,
                      background: 'linear-gradient(180deg,#ff6b35,#f7c948)',
                    }} />
                  )}
                  <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                  {item.label}
                  {isActive && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
                </div>
              </Link>
            )
          })}

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--border)', margin: '10px 4px' }} />

          {/* Kitchen Screen link */}
          {restaurantSlug && (
            <a
              href={`/kitchen/${restaurantSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 11,
                background: 'rgba(34,197,94,0.07)',
                border: '1px solid rgba(34,197,94,0.15)',
                color: '#4ade80', fontSize: 14, fontWeight: 600,
                transition: 'all 0.15s', cursor: 'pointer',
              }}>
                <Monitor size={16} />
                Kitchen Display
                <span style={{ marginLeft: 'auto', fontSize: 11, opacity: 0.7 }}>↗</span>
              </div>
            </a>
          )}
        </nav>

        {/* Footer */}
        <div style={{ marginTop: 8 }}>
          {restaurantSlug && (
            <a
              href={`/menu/${restaurantSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', display: 'block', marginBottom: 4 }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 11,
                color: 'var(--text-muted)', fontSize: 13, fontWeight: 500,
                transition: 'all 0.15s', cursor: 'pointer',
              }}>
                <span style={{ fontSize: 14 }}>📱</span>
                View Live Menu ↗
              </div>
            </a>
          )}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 11,
              background: 'transparent', border: 'none',
              color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer',
              width: '100%', transition: 'all 0.15s', fontFamily: 'Inter, sans-serif',
            }}
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
        {/* Top bar */}
        <div style={{
          height: 56, display: 'flex', alignItems: 'center',
          padding: '0 28px', borderBottom: '1px solid var(--border)',
          background: 'rgba(8,8,16,0.8)', backdropFilter: 'blur(12px)',
          position: 'sticky', top: 0, zIndex: 20,
          gap: 8,
        }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>MenuQR</span>
          <span style={{ color: 'var(--border)', fontSize: 13 }}>/</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>
            {currentPage?.label || 'Dashboard'}
          </span>
        </div>

        <div style={{ padding: '32px 28px', maxWidth: 1200 }}>
          {children}
        </div>
      </main>
    </div>
  )
}
