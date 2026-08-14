'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Order, OrderStatus } from '@/types'

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; border: string }> = {
  new:       { label: 'New',       color: '#ef4444', bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.35)'   },
  preparing: { label: 'Preparing', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.35)' },
  ready:     { label: 'Ready',     color: '#22c55e', bg: 'rgba(34,197,94,0.1)',    border: 'rgba(34,197,94,0.35)'  },
  done:      { label: 'Done',      color: '#6b7280', bg: 'rgba(107,114,128,0.07)', border: 'rgba(107,114,128,0.2)' },
}

const ORDER_TYPE_COLOR: Record<string, string> = {
  dine_in: '#60a5fa', takeaway: '#f7c948', delivery: '#f97316',
}

type FilterTab = 'active' | 'all' | 'done'

interface OrderItem {
  name: string
  quantity: number
  price: number
  options?: string[]
  notes?: string
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

export default function OrdersPage() {
  const supabase = createClient()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [restaurantId, setRestaurantId] = useState('')
  const [restaurantSlug, setRestaurantSlug] = useState('')
  const [filter, setFilter] = useState<FilterTab>('active')
  const [updating, setUpdating] = useState<string | null>(null)

  const loadOrders = useCallback(async (restId: string) => {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('restaurant_id', restId)
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(200)
    setOrders(data || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: rest } = await supabase
        .from('restaurants')
        .select('id, slug')
        .eq('owner_user_id', user.id)
        .single()
      if (!rest) return
      setRestaurantId(rest.id)
      setRestaurantSlug(rest.slug)
      loadOrders(rest.id)

      // Real-time subscription
      const channel = supabase
        .channel(`orders-dashboard-${rest.id}`)
        .on('postgres_changes', {
          event: '*', schema: 'public', table: 'orders',
          filter: `restaurant_id=eq.${rest.id}`,
        }, () => loadOrders(rest.id))
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
    init()
  }, [supabase, loadOrders])

  async function updateStatus(orderId: string, status: OrderStatus) {
    setUpdating(orderId)
    try {
      await fetch('/api/orders/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      })
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
    } finally {
      setUpdating(null)
    }
  }

  const activeOrders = orders.filter(o => o.status !== 'done')
  const doneOrders = orders.filter(o => o.status === 'done')
  const displayOrders = filter === 'active' ? activeOrders : filter === 'done' ? doneOrders : orders

  const stats = {
    new: orders.filter(o => o.status === 'new').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    done: doneOrders.length,
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px' }}>Live Orders</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>
            Real-time orders from customers · auto-updates
          </p>
        </div>
        {restaurantSlug && (
          <a
            href={`/kitchen/${restaurantSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'linear-gradient(135deg, rgba(255,107,53,0.15), rgba(247,201,72,0.15))',
              border: '1px solid rgba(255,107,53,0.3)',
              borderRadius: 12,
              padding: '10px 18px',
              color: '#ff6b35',
              fontSize: 13,
              fontWeight: 700,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s',
            }}
          >
            🍳 Open Kitchen Display
          </a>
        )}
      </div>

      {/* Stats bar */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24,
      }}>
        {[
          { label: 'New', value: stats.new, color: '#ef4444', icon: '🆕' },
          { label: 'Preparing', value: stats.preparing, color: '#f59e0b', icon: '🍳' },
          { label: 'Ready', value: stats.ready, color: '#22c55e', icon: '✅' },
          { label: 'Done Today', value: stats.done, color: '#6b7280', icon: '📋' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 14, padding: '14px 16px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {([
          { key: 'active', label: `Active (${activeOrders.length})` },
          { key: 'all',    label: `All (${orders.length})` },
          { key: 'done',   label: `Done (${doneOrders.length})` },
        ] as { key: FilterTab; label: string }[]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              border: `1.5px solid ${filter === tab.key ? '#ff6b35' : 'var(--border)'}`,
              background: filter === tab.key ? 'rgba(255,107,53,0.1)' : 'transparent',
              color: filter === tab.key ? '#ff6b35' : 'var(--text-secondary)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading orders…</p>
      ) : displayOrders.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)', border: '2px dashed var(--border)',
          borderRadius: 16, padding: 48, textAlign: 'center',
        }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>🍽️</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
            {filter === 'active'
              ? 'No active orders. New orders will appear here in real-time.'
              : 'No orders found.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {displayOrders.map(order => {
            const cfg = STATUS_CONFIG[order.status]
            const items = (order.order_items as unknown as OrderItem[]) || []
            const isUpdating = updating === order.id

            return (
              <div key={order.id} style={{
                background: 'var(--bg-card)',
                border: `1px solid ${order.status !== 'done' ? cfg.border : 'var(--border)'}`,
                borderRadius: 16,
                padding: '16px 20px',
                transition: 'all 0.2s',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                  {/* Left: table + meta */}
                  <div style={{ minWidth: 120 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        fontSize: 28, fontWeight: 900, color: '#f4f4f6',
                        letterSpacing: '-1px',
                      }}>
                        {order.table_number ? `T${order.table_number}` : '—'}
                      </span>
                      <span style={{
                        fontSize: 11, fontWeight: 700,
                        background: `${ORDER_TYPE_COLOR[order.order_type] || '#9999b0'}20`,
                        color: ORDER_TYPE_COLOR[order.order_type] || '#9999b0',
                        borderRadius: 6, padding: '2px 8px',
                      }}>
                        {order.order_type.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    {order.customer_name && (
                      <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '2px 0 0' }}>
                        👤 {order.customer_name}
                      </p>
                    )}
                    <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: '2px 0 0' }}>
                      ⏱ {timeAgo(order.created_at)} · {formatTime(order.created_at)}
                    </p>
                  </div>

                  {/* Center: items */}
                  <div style={{ flex: 1, minWidth: 200 }}>
                    {items.map((item, i) => (
                      <div key={i} style={{
                        fontSize: 14, color: 'var(--text-primary)',
                        padding: '2px 0',
                        display: 'flex', alignItems: 'flex-start', gap: 6,
                      }}>
                        <span style={{
                          color: '#ff6b35', fontWeight: 800, minWidth: 28, fontSize: 13,
                        }}>{item.quantity}×</span>
                        <div>
                          <span style={{ fontWeight: 600 }}>{item.name}</span>
                          {item.options && item.options.length > 0 && (
                            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}> · {item.options.join(', ')}</span>
                          )}
                          {item.notes && (
                            <span style={{ color: '#f59e0b', fontSize: 12 }}> 📝 {item.notes}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Right: total + status + actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, minWidth: 140 }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#f4f4f6' }}>
                      ₹{(order.total_amount || 0).toFixed(0)}
                    </span>

                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                      background: cfg.bg, color: cfg.color,
                      border: `1px solid ${cfg.border}`,
                    }}>
                      {cfg.label.toUpperCase()}
                    </span>

                    {/* Status action buttons */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {order.status === 'new' && (
                        <button
                          onClick={() => updateStatus(order.id, 'preparing')}
                          disabled={isUpdating}
                          style={{
                            background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)',
                            borderRadius: 8, padding: '5px 12px', color: '#f59e0b',
                            fontSize: 12, fontWeight: 700, cursor: 'pointer',
                          }}
                        >
                          {isUpdating ? '…' : '🍳 Prepare'}
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button
                          onClick={() => updateStatus(order.id, 'ready')}
                          disabled={isUpdating}
                          style={{
                            background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)',
                            borderRadius: 8, padding: '5px 12px', color: '#22c55e',
                            fontSize: 12, fontWeight: 700, cursor: 'pointer',
                          }}
                        >
                          {isUpdating ? '…' : '✓ Mark Ready'}
                        </button>
                      )}
                      {order.status === 'ready' && (
                        <button
                          onClick={() => updateStatus(order.id, 'done')}
                          disabled={isUpdating}
                          style={{
                            background: 'rgba(107,114,128,0.1)', border: '1px solid rgba(107,114,128,0.25)',
                            borderRadius: 8, padding: '5px 12px', color: '#9ca3af',
                            fontSize: 12, fontWeight: 700, cursor: 'pointer',
                          }}
                        >
                          {isUpdating ? '…' : '✅ Done'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
