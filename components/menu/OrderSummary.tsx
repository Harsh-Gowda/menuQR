'use client'

import { useState } from 'react'
import { CartItem, Restaurant, Language, OrderType } from '@/types'

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
  onClose, onUpdateQty, onRemove, onClearCart,
}: OrderSummaryProps) {
  const [orderType, setOrderType] = useState<OrderType>(tableNumber ? 'dine_in' : 'takeaway')
  const [customerName, setCustomerName] = useState('')
  const [placing, setPlacing] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const isRTL = language === 'ar'

  async function handlePlaceOrder() {
    setPlacing(true)
    setError('')
    try {
      const orderItems = cart.map(ci => ({
        name: ci.menuItem.name_en,
        name_ar: ci.menuItem.name_ar,
        quantity: ci.quantity,
        price: ci.totalPrice,
        unitPrice: ci.menuItem.price,
        options: Object.values(ci.selectedOptions).map(o => o.label),
        notes: ci.notes,
      }))

      const res = await fetch('/api/orders/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          tableNumber: tableNumber || null,
          customerName: customerName.trim() || null,
          orderType,
          orderItems,
          orderSummary: cart.map(ci => `${ci.quantity}× ${ci.menuItem.name_en}`).join(', '),
          subtotal,
          taxAmount: vatAmount,
          total,
          source: tableNumber ? 'qr' : 'link',
          language,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setOrderId(data.orderId)
        setTimeout(() => onClearCart(), 5000)
      } else {
        setError(data.error || 'Failed to place order. Please try again.')
      }
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setPlacing(false)
    }
  }

  // ── Order confirmed screen ──────────────────────────────────
  if (orderId) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}>
        <div className="animate-bounce-in" style={{
          background: 'linear-gradient(135deg, #1a1a24, #0f0f13)',
          borderRadius: 24,
          border: '1px solid #2a2a3a',
          padding: '40px 32px',
          textAlign: 'center',
          maxWidth: 360,
          width: '100%',
        }}>
          {/* Pulsing success ring */}
          <div style={{ position: 'relative', display: 'inline-flex', marginBottom: 20 }}>
            <div style={{
              width: 88, height: 88, borderRadius: '50%',
              background: 'rgba(34,197,94,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'pulse 2s infinite',
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'rgba(34,197,94,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36,
              }}>✅</div>
            </div>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f4f4f6', marginBottom: 8, letterSpacing: '-0.3px' }}>
            Order Placed! 🎉
          </h2>
          <p style={{ color: '#9999b0', lineHeight: 1.6, marginBottom: 20, fontSize: 15 }}>
            {tableNumber
              ? `Your order for Table ${tableNumber} has been sent to the kitchen!`
              : 'Your order has been sent! Staff will confirm shortly.'}
          </p>

          {tableNumber && (
            <div style={{
              background: 'rgba(34,197,94,0.08)',
              border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: 12,
              padding: '12px 20px',
              marginBottom: 20,
            }}>
              <p style={{ color: '#4ade80', fontSize: 13, fontWeight: 600, margin: 0 }}>
                🍳 Kitchen is preparing your order
              </p>
            </div>
          )}

          <div style={{
            background: '#0f0f13', borderRadius: 10,
            padding: '10px 16px', marginBottom: 4,
          }}>
            <p style={{ color: '#55556a', fontSize: 12, margin: 0 }}>
              Order ID: <span style={{ color: '#9999b0', fontFamily: 'monospace' }}>#{orderId.slice(-8).toUpperCase()}</span>
            </p>
          </div>
          <p style={{ color: '#55556a', fontSize: 12, margin: 0, marginTop: 8 }}>
            Screen closes automatically in a few seconds…
          </p>
        </div>
      </div>
    )
  }

  // ── Order summary sheet ────────────────────────────────────
  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <div
        className="animate-slide-up"
        style={{
          width: '100%', maxWidth: 480,
          background: '#1a1a24',
          borderRadius: '20px 20px 0 0',
          border: '1px solid #2a2a3a',
          maxHeight: '92vh', overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px',
          borderBottom: '1px solid #2a2a3a',
          position: 'sticky', top: 0, background: '#1a1a24', zIndex: 1,
        }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{t.menu.yourOrder}</h2>
            {tableNumber && (
              <p style={{ fontSize: 13, color: '#9999b0', margin: '2px 0 0' }}>
                {t.menu.table} {tableNumber}
              </p>
            )}
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px 12px', fontSize: 14 }}>
            ✕
          </button>
        </div>

        <div style={{ padding: '16px 20px 24px' }}>
          {/* Cart items */}
          <div style={{ marginBottom: 20 }}>
            {cart.map((ci, index) => {
              const name = language === 'ar' && ci.menuItem.name_ar ? ci.menuItem.name_ar : ci.menuItem.name_en
              const opts = Object.values(ci.selectedOptions).map(o =>
                language === 'ar' && o.label_ar ? o.label_ar : o.label
              ).join(', ')
              return (
                <div key={index} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px solid #2a2a3a',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {ci.menuItem.is_veg ? <div className="veg-dot" /> : <div className="nonveg-dot" />}
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f6' }}>{name}</span>
                    </div>
                    {opts && <p style={{ fontSize: 12, color: '#9999b0', margin: '2px 0 0 20px' }}>{opts}</p>}
                    {ci.notes && <p style={{ fontSize: 12, color: '#55556a', margin: '2px 0 0 20px' }}>Note: {ci.notes}</p>}
                  </div>
                  {/* Qty controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      background: '#0f0f13', borderRadius: 8, border: '1px solid #2a2a3a',
                    }}>
                      <button
                        onClick={() => onUpdateQty(index, ci.quantity - 1)}
                        style={{ width: 30, height: 30, background: 'transparent', border: 'none', color: '#9999b0', cursor: 'pointer', fontSize: 16 }}
                      >−</button>
                      <span style={{ minWidth: 22, textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#f4f4f6' }}>{ci.quantity}</span>
                      <button
                        onClick={() => onUpdateQty(index, ci.quantity + 1)}
                        style={{ width: 30, height: 30, background: 'transparent', border: 'none', color: '#f4f4f6', cursor: 'pointer', fontSize: 16 }}
                      >+</button>
                    </div>
                    <span style={{ minWidth: 64, textAlign: 'right', fontSize: 14, fontWeight: 700, color: '#f4f4f6' }}>
                      {currency} {ci.totalPrice % 1 === 0 ? ci.totalPrice : ci.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Totals */}
          <div style={{
            background: '#0f0f13', borderRadius: 12, padding: '14px 16px', marginBottom: 20,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: '#9999b0' }}>
              <span>{t.menu.subtotal}</span>
              <span>{currency} {subtotal.toFixed(2)}</span>
            </div>
            {vatAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: '#9999b0' }}>
                <span>{t.menu.vat} ({vatRate}%)</span>
                <span>{currency} {vatAmount.toFixed(2)}</span>
              </div>
            )}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 17, fontWeight: 700, color: '#f4f4f6',
              borderTop: '1px solid #2a2a3a', paddingTop: 10, marginTop: 4,
            }}>
              <span>{t.menu.total}</span>
              <span className="gradient-text">{currency} {total.toFixed(2)}</span>
            </div>
          </div>

          {/* Order type */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#9999b0', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              {t.menu.selectOrderType}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {([
                { type: 'dine_in' as OrderType, label: t.menu.dineIn, emoji: '🪑' },
                { type: 'takeaway' as OrderType, label: t.menu.takeaway, emoji: '🛍️' },
                { type: 'delivery' as OrderType, label: t.menu.delivery, emoji: '🛵' },
              ]).map(ot => (
                <button
                  key={ot.type}
                  onClick={() => setOrderType(ot.type)}
                  style={{
                    flex: 1, padding: '10px 4px',
                    background: orderType === ot.type ? 'rgba(255,107,53,0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1.5px solid ${orderType === ot.type ? '#ff6b35' : '#2a2a3a'}`,
                    borderRadius: 10, color: orderType === ot.type ? '#ff6b35' : '#9999b0',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  }}
                >
                  <span style={{ fontSize: 18 }}>{ot.emoji}</span>
                  {ot.label}
                </button>
              ))}
            </div>
          </div>

          {/* Optional customer name */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#9999b0', display: 'block', marginBottom: 8 }}>
              Your Name <span style={{ color: '#55556a', fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              id="customer-name-input"
              type="text"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="e.g. Raj, Table 5 guest..."
              className="input-base"
              maxLength={50}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 10, padding: '10px 14px', marginBottom: 16,
            }}>
              <p style={{ color: '#f87171', fontSize: 13, margin: 0 }}>⚠️ {error}</p>
            </div>
          )}

          {/* Place Order button */}
          <button
            id="place-order-btn"
            onClick={handlePlaceOrder}
            disabled={placing}
            style={{
              width: '100%',
              background: placing
                ? 'rgba(255,107,53,0.4)'
                : 'linear-gradient(135deg, #ff6b35, #e85520)',
              border: 'none',
              borderRadius: 14,
              padding: '16px 20px',
              color: 'white',
              fontSize: 17,
              fontWeight: 700,
              cursor: placing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              transition: 'all 0.2s',
              letterSpacing: '-0.2px',
            }}
          >
            {placing ? (
              <>
                <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
                Placing Order…
              </>
            ) : (
              <>
                <span style={{ fontSize: 20 }}>🍽️</span>
                Place Order
                <span style={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: 6, padding: '2px 8px', fontSize: 14,
                }}>
                  {currency} {total.toFixed(2)}
                </span>
              </>
            )}
          </button>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#55556a', marginTop: 12, lineHeight: 1.5 }}>
            🔒 No phone number required • Order goes directly to the kitchen
          </p>
        </div>
      </div>
    </div>
  )
}
