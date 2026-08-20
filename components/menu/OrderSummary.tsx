'use client'

import { CartItem, Restaurant, Language } from '@/types'
import { useState } from 'react'
import { Plus, Minus, X, Info } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface OrderSummaryProps {
  cart: CartItem[]
  restaurant: Restaurant
  tableNumber?: string
  language: Language
  t: any
  currency: string
  subtotal: number
  vatAmount: number
  vatRate: number
  total: number
  onClose: () => void
  onUpdateQty: (index: number, qty: number) => void
  onRemove: (index: number) => void
  onClearCart: () => void
}

export default function OrderSummary({
  cart, restaurant, tableNumber, language, t, currency,
  subtotal, vatAmount, vatRate, total,
  onClose, onUpdateQty, onRemove, onClearCart
}: OrderSummaryProps) {
  const isRTL = language === 'ar'
  const [customerName, setCustomerName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handlePlaceOrder() {
    if (cart.length === 0) return
    setSubmitting(true)
    setError('')

    const res = await fetch('/api/orders/place', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurantId: restaurant.id,
        tableNumber: tableNumber || 'Takeaway',
        customerName: customerName || null,
        items: cart,
        subtotal,
        vatAmount,
        total,
      })
    })
    
    const data = await res.json()
    if (!res.ok || !data.success) {
      setError(data.error || 'Failed to place order')
      setSubmitting(false)
      return
    }

    onClearCart()
    router.push(`/menu/${restaurant.slug}/${tableNumber || ''}?order_success=true`)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }}>
      <div className="animate-slide-up" style={{
        background: 'var(--bg-base)', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.1)',
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>{t.cart.title}</h2>
          <button onClick={onClose} style={{ background: 'var(--bg-surface)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
          {error && (
            <div style={{ background: '#FEF2F2', color: '#B91C1C', padding: 12, borderRadius: 'var(--radius-md)', marginBottom: 20, fontSize: 14, fontWeight: 600 }}>
              {error}
            </div>
          )}

          {cart.map((item, idx) => {
            const name = isRTL && item.menuItem.name_ar ? item.menuItem.name_ar : item.menuItem.name_en
            return (
              <div key={idx} style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-surface)', overflow: 'hidden', flexShrink: 0 }}>
                  {item.menuItem.image_url ? (
                    <img src={item.menuItem.image_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🍽️</div>
                  )}
                </div>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{name}</h4>
                    <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: 16 }}>{currency} {item.totalPrice}</span>
                  </div>
                  
                  {/* Stepper (Like mobile image) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', background: 'var(--brand-primary)', color: 'white',
                      borderRadius: 'var(--radius-pill)', padding: '4px 12px', gap: 16
                    }}>
                      <button onClick={() => onUpdateQty(idx, item.quantity - 1)} style={{ background: 'transparent', border: 'none', color: 'white', display: 'flex', alignItems: 'center', padding: 0, cursor: 'pointer' }}>
                        <Minus size={14} strokeWidth={4} />
                      </button>
                      <span style={{ fontWeight: 800, fontSize: 14 }}>{item.quantity}</span>
                      <button onClick={() => onUpdateQty(idx, item.quantity + 1)} style={{ background: 'transparent', border: 'none', color: 'white', display: 'flex', alignItems: 'center', padding: 0, cursor: 'pointer' }}>
                        <Plus size={14} strokeWidth={4} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer Checkout */}
        <div style={{ padding: '24px', background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>
              Your Name (Optional)
            </label>
            <input
              type="text"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="e.g. John Doe"
              className="input-base"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 15, color: 'var(--text-secondary)' }}>
            <span>{t.cart.subtotal}</span>
            <span>{currency} {subtotal}</span>
          </div>
          
          {vatAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 15, color: 'var(--text-secondary)' }}>
              <span>VAT ({vatRate}%)</span>
              <span>{currency} {vatAmount.toFixed(2)}</span>
            </div>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
            <span>{t.cart.total}</span>
            <span>{currency} {total % 1 === 0 ? total : total.toFixed(2)}</span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={submitting}
            style={{
              width: '100%', background: 'var(--brand-primary)', color: 'white',
              border: 'none', borderRadius: 'var(--radius-pill)', padding: '16px',
              fontSize: 16, fontWeight: 800, cursor: 'pointer',
              opacity: submitting ? 0.7 : 1, transition: 'all 0.2s',
            }}
          >
            {submitting ? 'Placing Order...' : t.cart.checkout}
          </button>
        </div>
        
      </div>
    </div>
  )
}
