'use client'

import { useState } from 'react'
import { CartItem, Restaurant, Language, OrderType } from '@/types'
import { buildWhatsAppOrderURL } from '@/lib/whatsapp'

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
  const [ordered, setOrdered] = useState(false)

  async function handleWhatsAppOrder() {
    const url = buildWhatsAppOrderURL({
      restaurantWhatsApp: restaurant.whatsapp_number,
      restaurantNameEn: restaurant.name_en,
      restaurantNameAr: restaurant.name_ar || undefined,
      tableNumber,
      orderType,
      items: cart,
      subtotal,
      vatAmount,
      vatPercentage: vatRate,
      total,
      customerName: customerName || undefined,
      language,
    })

    // Log order
    const orderItems = cart.map(ci => ({
      name: ci.menuItem.name_en,
      name_hi: ci.menuItem.name_hi,
      quantity: ci.quantity,
      price: ci.totalPrice,
      options: Object.values(ci.selectedOptions).map(o => o.label),
      notes: ci.notes,
    }))

    fetch('/api/orders/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurantId: restaurant.id,
        tableNumber,
        orderType,
        orderSummary: cart.map(ci => `${ci.quantity}x ${ci.menuItem.name_en}`).join(', '),
        orderItems,
        subtotal,
        gstAmount: vatAmount,
        total,
        customerName: customerName || null,
        source: tableNumber ? 'qr' : 'link',
        language,
      }),
    }).catch(() => {})

    setOrdered(true)
    window.open(url, '_blank')
    setTimeout(() => { onClearCart() }, 3000)
  }

  if (ordered) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}>
        <div className="animate-bounce-in" style={{
          background: '#1a1a24', borderRadius: 20, border: '1px solid #2a2a3a',
          padding: 40, textAlign: 'center', maxWidth: 360, width: '100%',
        }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{t.menu.orderSentTitle}</h2>
          <p style={{ color: '#9999b0', lineHeight: 1.6 }}>{t.menu.orderSentBody}</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
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
              const name = language === 'hi' && ci.menuItem.name_hi ? ci.menuItem.name_hi : ci.menuItem.name_en
              const opts = Object.values(ci.selectedOptions).map(o => language === 'hi' && o.label_hi ? o.label_hi : o.label).join(', ')
              return (
                <div key={index} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px solid #2a2a3a',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {ci.menuItem.is_veg ? <div className="veg-dot" /> : <div className="nonveg-dot" />}
                      <span style={{
                        fontSize: 14, fontWeight: 600, color: '#f4f4f6',
                        fontFamily: language === 'hi' ? 'Noto Sans Devanagari, sans-serif' : 'Inter, sans-serif',
                      }}>{name}</span>
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

          {/* Customer name */}
          <div style={{ marginBottom: 24 }}>
            <input
              id="customer-name-input"
              type="text"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder={t.menu.yourName}
              className="input-base"
            />
          </div>

          {/* WhatsApp button */}
          <button
            id="whatsapp-order-btn"
            onClick={handleWhatsAppOrder}
            className="btn-whatsapp whatsapp-btn-pulse"
          >
            <span style={{ fontSize: 22 }}>💬</span>
            <span>{t.menu.orderViaWhatsapp}</span>
          </button>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#55556a', marginTop: 12, lineHeight: 1.5 }}>
            WhatsApp will open with your order pre-filled.
            Just tap Send to place your order.
          </p>
        </div>
      </div>
    </div>
  )
}
