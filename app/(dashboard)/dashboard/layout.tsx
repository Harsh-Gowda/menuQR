'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, UtensilsCrossed, QrCode, ShoppingBag, Settings, LogOut, ExternalLink } from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/menu', icon: UtensilsCrossed, label: 'Menu' },
  { href: '/dashboard/tables', icon: QrCode, label: 'Tables & QR' },
  { href: '/dashboard/orders', icon: ShoppingBag, label: 'Orders' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        flexShrink: 0,
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 12px',
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}>
        {/* Logo */}
        <Link href="/dashboard" style={{ textDecoration: 'none', marginBottom: 32 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'linear-gradient(135deg, #ff6b35, #f7c948)',
            borderRadius: 10, padding: '8px 12px',
          }}>
            <span style={{ fontSize: 18 }}>🍽️</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: 'white' }}>MenuQR.in</span>
          </div>
        </Link>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(item => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 10,
                  background: isActive ? 'rgba(255,107,53,0.1)' : 'transparent',
                  color: isActive ? '#ff6b35' : 'var(--text-secondary)',
                  fontSize: 14, fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.15s',
                  cursor: 'pointer',
                }}>
                  <item.icon size={17} />
                  {item.label}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Bottom actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10,
              background: 'transparent', border: 'none',
              color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer',
              width: '100%', transition: 'all 0.15s',
            }}
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
        {children}
      </main>
    </div>
  )
}
