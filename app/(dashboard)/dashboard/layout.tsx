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
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-surface)' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 260, flexShrink: 0,
        background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        padding: '24px 16px', position: 'sticky', top: 0, height: '100vh', zIndex: 30,
      }}>

        {/* Logo */}
        <Link href="/dashboard" style={{ textDecoration: 'none', marginBottom: 32 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px', borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--brand-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 800, fontSize: 16,
            }}>M</div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px' }}>MenuQR</p>
              {restaurantName && (
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, fontWeight: 500 }}>
                  {restaurantName.length > 16 ? restaurantName.slice(0, 16) + '…' : restaurantName}
                </p>
              )}
            </div>
          </div>
        </Link>

        {/* Nav label */}
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', padding: '0 12px', marginBottom: 12, textTransform: 'uppercase' }}>
          Menu
        </p>

        {/* Nav items */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(item => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 'var(--radius-md)',
                  background: isActive ? 'var(--brand-primary-light)' : 'transparent',
                  color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  fontSize: 14, fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.15s', cursor: 'pointer',
                }}>
                  <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  {item.label}
                  {isActive && <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
                </div>
              </Link>
            )
          })}

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--border)', margin: '16px 8px' }} />

          {/* Kitchen Screen link */}
          {restaurantSlug && (
            <a href={`/kitchen/${restaurantSlug}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', borderRadius: 'var(--radius-md)',
                background: '#f0fdf4', border: '1px solid #bbf7d0',
                color: '#166534', fontSize: 14, fontWeight: 600,
                transition: 'all 0.15s', cursor: 'pointer',
              }}>
                <Monitor size={18} />
                Kitchen Display
                <span style={{ marginLeft: 'auto', fontSize: 14, opacity: 0.7 }}>↗</span>
              </div>
            </a>
          )}
        </nav>

        {/* Footer */}
        <div style={{ marginTop: 12 }}>
          {restaurantSlug && (
            <a href={`/menu/${restaurantSlug}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', marginBottom: 4 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', borderRadius: 'var(--radius-md)',
                color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500,
                transition: 'all 0.15s', cursor: 'pointer',
              }}>
                <span style={{ fontSize: 16 }}>📱</span>
                View Live Menu ↗
              </div>
            </a>
          )}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', borderRadius: 'var(--radius-md)',
              background: 'transparent', border: 'none',
              color: 'var(--text-secondary)', fontSize: 14, cursor: 'pointer',
              width: '100%', transition: 'all 0.15s', fontWeight: 500, fontFamily: 'inherit',
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <div style={{
          height: 64, display: 'flex', alignItems: 'center',
          padding: '0 32px', borderBottom: '1px solid var(--border)',
          background: 'var(--bg-base)', position: 'sticky', top: 0, zIndex: 20,
          gap: 10,
        }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 500 }}>MenuQR</span>
          <span style={{ color: 'var(--border)', fontSize: 14 }}>/</span>
          <span style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 600 }}>
            {currentPage?.label || 'Dashboard'}
          </span>
        </div>

        <div style={{ padding: '32px', maxWidth: 1200, flex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  )
}
