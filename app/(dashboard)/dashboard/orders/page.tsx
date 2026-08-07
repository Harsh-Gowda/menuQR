'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { OrderLog } from '@/types'

export default function OrdersPage() {
  const supabase = createClient()
  const [orders, setOrders] = useState<OrderLog[]>([])
  const [loading, setLoading] = useState(true)
  const [restaurantId, setRestaurantId] = useState('')

  useEffect(() => { loadOrders() }, [])

  async function loadOrders() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: rest } = await supabase.from('restaurants').select('id').eq('owner_user_id', user.id).single()
    if (!rest) return
    setRestaurantId(rest.id)
    const { data } = await supabase
      .from('order_logs')
      .select('*')
      .eq('restaurant_id', rest.id)
      .order('created_at', { ascending: false })
      .limit(100)
    setOrders(data || [])
    setLoading(false)
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    })
  }

  const orderTypeColor: Record<string, string> = {
    dine_in: '#60a5fa', takeaway: '#f7c948', delivery: '#f97316',
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px' }}>Order Log</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>
          WhatsApp orders logged automatically when customers tap the order button.
        </p>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading orders...</p>
      ) : orders.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)', border: '2px dashed var(--border)',
          borderRadius: 16, padding: 48, textAlign: 'center',
        }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>📱</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
            No orders yet. Once customers start ordering via WhatsApp, they&apos;ll appear here.
          </p>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '160px 80px 80px 100px 1fr 120px',
            gap: 12,
            padding: '12px 20px',
            borderBottom: '1px solid var(--border)',
            fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            <span>Time</span>
            <span>Table</span>
            <span>Type</span>
            <span>Total</span>
            <span>Items</span>
            <span>Customer</span>
          </div>
          {orders.map(order => (
            <div key={order.id} style={{
              display: 'grid',
              gridTemplateColumns: '160px 80px 80px 100px 1fr 120px',
              gap: 12,
              padding: '14px 20px',
              borderBottom: '1px solid var(--border)',
              alignItems: 'center',
              fontSize: 14,
            }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{formatTime(order.created_at)}</span>
              <span style={{ fontWeight: 600 }}>{order.table_number || '—'}</span>
              <span>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                  background: `${orderTypeColor[order.order_type] || '#9999b0'}22`,
                  color: orderTypeColor[order.order_type] || '#9999b0',
                  textTransform: 'capitalize',
                }}>
                  {order.order_type.replace('_', ' ')}
                </span>
              </span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                ₹{(order.total_amount || 0).toFixed(0)}
              </span>
              <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {order.order_summary}
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {order.customer_name || '—'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
