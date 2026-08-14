'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Order, OrderStatus } from '@/types'

interface OrderItem {
  name: string
  name_ar?: string
  quantity: number
  price: number
  options?: string[]
  notes?: string
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; border: string; pulse?: boolean }> = {
  new:       { label: 'NEW',       color: '#ef4444', bg: 'rgba(239,68,68,0.12)',    border: 'rgba(239,68,68,0.4)',   pulse: true },
  preparing: { label: 'PREPARING', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',   border: 'rgba(245,158,11,0.4)' },
  ready:     { label: 'READY ✓',   color: '#22c55e', bg: 'rgba(34,197,94,0.12)',    border: 'rgba(34,197,94,0.4)'  },
  done:      { label: 'DONE',      color: '#6b7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.2)' },
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

function OrderCard({ order, onStatusChange }: { order: Order; onStatusChange: (id: string, status: OrderStatus) => void }) {
  const [updating, setUpdating] = useState(false)
  const cfg = STATUS_CONFIG[order.status]
  const items = (order.order_items as unknown as OrderItem[]) || []

  const nextStatus: Record<OrderStatus, OrderStatus | null> = {
    new: 'preparing',
    preparing: 'ready',
    ready: 'done',
    done: null,
  }
  const nextLabels: Record<OrderStatus, string> = {
    new: '▶ Start Preparing',
    preparing: '✓ Mark Ready',
    ready: '✅ Mark Done',
    done: '',
  }

  async function handleNext() {
    const next = nextStatus[order.status]
    if (!next) return
    setUpdating(true)
    try {
      const res = await fetch('/api/orders/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, status: next }),
      })
      if (res.ok) onStatusChange(order.id, next)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div style={{
      background: cfg.bg,
      border: `2px solid ${cfg.border}`,
      borderRadius: 20,
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
    }}>
      {/* Pulse animation for new orders */}
      {cfg.pulse && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 20,
          border: `2px solid ${cfg.border}`,
          animation: 'kitchenPulse 2s ease-out infinite',
          pointerEvents: 'none',
        }} />
      )}

      {/* Table + Status header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <div style={{
            fontSize: 42, fontWeight: 900, color: '#f4f4f6', lineHeight: 1,
            letterSpacing: '-2px', fontVariantNumeric: 'tabular-nums',
          }}>
            {order.table_number ? `T${order.table_number}` : '—'}
          </div>
          {order.customer_name && (
            <p style={{ color: '#9999b0', fontSize: 14, margin: '4px 0 0', fontWeight: 500 }}>
              👤 {order.customer_name}
            </p>
          )}
          <p style={{ color: '#55556a', fontSize: 12, margin: '2px 0 0' }}>
            ⏱ {timeAgo(order.created_at)}
          </p>
        </div>
        <div style={{
          background: cfg.bg, border: `1.5px solid ${cfg.border}`,
          borderRadius: 12, padding: '6px 12px',
          color: cfg.color, fontSize: 11, fontWeight: 800,
          letterSpacing: '0.08em',
          flexShrink: 0,
        }}>
          {cfg.label}
        </div>
      </div>

      {/* Order items */}
      <div style={{
        background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: '12px 14px',
      }}>
        {items.map((item, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            padding: '5px 0',
            borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            gap: 8,
          }}>
            <div style={{ flex: 1 }}>
              <span style={{
                fontSize: 15, fontWeight: 700, color: '#f4f4f6',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{
                  background: 'rgba(255,107,53,0.15)', color: '#ff6b35',
                  borderRadius: 6, padding: '1px 8px', fontSize: 14, fontWeight: 800,
                  minWidth: 28, textAlign: 'center',
                }}>
                  {item.quantity}×
                </span>
                {item.name}
              </span>
              {item.options && item.options.length > 0 && (
                <p style={{ color: '#9999b0', fontSize: 12, margin: '2px 0 0 36px' }}>
                  {item.options.join(' · ')}
                </p>
              )}
              {item.notes && (
                <p style={{ color: '#f59e0b', fontSize: 12, margin: '2px 0 0 36px' }}>
                  📝 {item.notes}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action button */}
      {nextStatus[order.status] && (
        <button
          onClick={handleNext}
          disabled={updating}
          style={{
            background: updating ? 'rgba(255,255,255,0.05)' : cfg.bg,
            border: `1.5px solid ${cfg.border}`,
            borderRadius: 12,
            padding: '10px 16px',
            color: cfg.color,
            fontSize: 13,
            fontWeight: 700,
            cursor: updating ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
            letterSpacing: '0.02em',
          }}
        >
          {updating ? '⏳ Updating…' : nextLabels[order.status]}
        </button>
      )}
    </div>
  )
}

export default function KitchenDisplay({ slug, restaurantName }: { slug: string; restaurantName: string }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const supabase = createClient()

  const fetchOrders = useCallback(async () => {
    const res = await fetch(`/api/kitchen/${slug}`)
    const data = await res.json()
    if (data.success) {
      setOrders(data.orders)
      setLastUpdated(new Date())
    }
    setLoading(false)
  }, [slug])

  useEffect(() => {
    fetchOrders()

    // Supabase Realtime subscription
    const channel = supabase
      .channel(`kitchen-${slug}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
      }, () => {
        fetchOrders()
      })
      .subscribe()

    // Fallback polling every 15 seconds
    const interval = setInterval(fetchOrders, 15000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [slug, fetchOrders, supabase])

  function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    setOrders(prev =>
      newStatus === 'done'
        ? prev.filter(o => o.id !== orderId)
        : prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
    )
  }

  // Group by status for display priority
  const newOrders      = orders.filter(o => o.status === 'new')
  const preparingOrders = orders.filter(o => o.status === 'preparing')
  const readyOrders    = orders.filter(o => o.status === 'ready')
  const activeOrders   = [...newOrders, ...preparingOrders, ...readyOrders]

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a10',
      fontFamily: "'Inter', sans-serif",
      padding: 0,
    }}>
      {/* Top bar */}
      <div style={{
        background: 'linear-gradient(90deg, #0f0f18 0%, #14141f 100%)',
        borderBottom: '1px solid #1e1e2e',
        padding: '14px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            background: 'linear-gradient(135deg, #ff6b35, #f7c948)',
            borderRadius: 10, width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, flexShrink: 0,
          }}>🍳</div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: '#f4f4f6', margin: 0, letterSpacing: '-0.3px' }}>
              {restaurantName} — Kitchen Display
            </h1>
            <p style={{ color: '#55556a', fontSize: 12, margin: 0 }}>
              Live orders · Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {[
            { count: newOrders.length,       label: 'New',       color: '#ef4444' },
            { count: preparingOrders.length,  label: 'Preparing', color: '#f59e0b' },
            { count: readyOrders.length,      label: 'Ready',     color: '#22c55e' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: stat.color, lineHeight: 1 }}>{stat.count}</div>
              <div style={{ fontSize: 10, color: '#55556a', fontWeight: 600, letterSpacing: '0.06em' }}>{stat.label.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div style={{ padding: 20 }}>
        {loading ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: 300, flexDirection: 'column', gap: 16,
          }}>
            <div style={{ fontSize: 48, animation: 'pulse 1.5s infinite' }}>🍳</div>
            <p style={{ color: '#55556a', fontSize: 16 }}>Loading orders…</p>
          </div>
        ) : activeOrders.length === 0 ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: 'calc(100vh - 120px)', flexDirection: 'column', gap: 16,
          }}>
            <div style={{ fontSize: 72 }}>🍽️</div>
            <h2 style={{ color: '#f4f4f6', fontSize: 22, fontWeight: 700, margin: 0 }}>All Clear!</h2>
            <p style={{ color: '#55556a', fontSize: 15 }}>No active orders. Waiting for new orders…</p>
            <div style={{
              background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: 12, padding: '10px 20px', marginTop: 8,
            }}>
              <p style={{ color: '#4ade80', fontSize: 13, fontWeight: 600, margin: 0 }}>
                ✅ Kitchen is ready
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Section labels */}
            {newOrders.length > 0 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />
                  <span style={{ color: '#ef4444', fontSize: 12, fontWeight: 800, letterSpacing: '0.1em' }}>
                    NEW ORDERS ({newOrders.length})
                  </span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(239,68,68,0.2)' }} />
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: 16,
                  marginBottom: 28,
                }}>
                  {newOrders.map(order => (
                    <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
                  ))}
                </div>
              </>
            )}

            {preparingOrders.length > 0 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
                  <span style={{ color: '#f59e0b', fontSize: 12, fontWeight: 800, letterSpacing: '0.1em' }}>
                    PREPARING ({preparingOrders.length})
                  </span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(245,158,11,0.2)' }} />
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: 16,
                  marginBottom: 28,
                }}>
                  {preparingOrders.map(order => (
                    <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
                  ))}
                </div>
              </>
            )}

            {readyOrders.length > 0 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
                  <span style={{ color: '#22c55e', fontSize: 12, fontWeight: 800, letterSpacing: '0.1em' }}>
                    READY TO SERVE ({readyOrders.length})
                  </span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(34,197,94,0.2)' }} />
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: 16,
                  marginBottom: 28,
                }}>
                  {readyOrders.map(order => (
                    <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes kitchenPulse {
          0% { opacity: 0.8; transform: scale(1); }
          70% { opacity: 0; transform: scale(1.04); }
          100% { opacity: 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
