'use client'

import { useEffect, useState } from 'react'
import { MenuItem, CartItem, CustomisationOption, Language } from '@/types'

interface ItemModalProps {
  item: MenuItem
  language: Language
  t: any
  onClose: () => void
  onAdd: (cartItem: CartItem) => void
}

export default function ItemModal({ item, language, t, onClose, onAdd }: ItemModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<{ [groupName: string]: CustomisationOption }>({})
  const [notes, setNotes] = useState('')

  const name = language === 'hi' && item.name_hi ? item.name_hi : item.name_en
  const desc = language === 'hi' && item.description_hi ? item.description_hi : item.description_en

  // Initialize first option of each group
  useEffect(() => {
    if (!item.customisation_groups) return
    const defaults: typeof selectedOptions = {}
    item.customisation_groups.forEach(group => {
      if (group.options.length > 0) defaults[group.name] = group.options[0]
    })
    setSelectedOptions(defaults)
  }, [item])

  const extraCost = Object.values(selectedOptions).reduce((s, o) => s + (o.price_add || 0), 0)
  const unitPrice = item.price + extraCost
  const totalPrice = unitPrice * quantity

  function handleAdd() {
    onAdd({ menuItem: item, quantity, selectedOptions, notes, totalPrice })
  }

  // Close on backdrop click
  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      onClick={handleBackdrop}
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
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Image */}
        {item.image_url ? (
          <div style={{ position: 'relative' }}>
            <img
              src={item.image_url}
              alt={item.name_en}
              style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: '20px 20px 0 0' }}
            />
            <button
              onClick={onClose}
              style={{
                position: 'absolute', top: 12, right: 12,
                background: 'rgba(0,0,0,0.6)', border: 'none',
                borderRadius: '50%', width: 36, height: 36,
                color: 'white', fontSize: 18, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px 0' }}>
            <button onClick={onClose} className="btn-ghost" style={{ padding: '6px 12px', fontSize: 13 }}>
              ✕ Close
            </button>
          </div>
        )}

        {/* Content */}
        <div style={{ padding: '20px 20px 24px' }}>
          {/* Veg dot + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            {item.is_veg ? <div className="veg-dot" /> : <div className="nonveg-dot" />}
            {item.is_spicy && <span className="badge badge-red">🌶️ Spicy</span>}
            {item.is_featured && <span className="badge badge-yellow">⭐ Best Seller</span>}
          </div>

          <h2 style={{
            fontSize: 20, fontWeight: 700, color: '#f4f4f6',
            margin: '0 0 4px',
            fontFamily: language === 'hi' ? 'Noto Sans Devanagari, sans-serif' : 'Inter, sans-serif',
          }}>
            {name}
          </h2>
          {language === 'hi' && item.name_hi && (
            <p style={{ fontSize: 14, color: '#55556a', margin: '0 0 12px' }}>{item.name_en}</p>
          )}
          {desc && (
            <p style={{ fontSize: 14, color: '#9999b0', lineHeight: 1.6, margin: '0 0 16px' }}>
              {desc}
            </p>
          )}

          {/* Allergens */}
          {item.allergens && item.allergens.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: '#9999b0' }}>
                ⚠️ Contains: {item.allergens.join(', ')}
              </p>
            </div>
          )}

          {/* Customisation groups */}
          {item.customisation_groups && item.customisation_groups.map(group => (
            <div key={group.name} style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#9999b0', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                {language === 'hi' && group.name_hi ? group.name_hi : group.name}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {group.options.map(opt => {
                  const isSelected = selectedOptions[group.name]?.label === opt.label
                  return (
                    <label
                      key={opt.label}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: isSelected ? 'rgba(255,107,53,0.08)' : 'rgba(255,255,255,0.03)',
                        border: `1.5px solid ${isSelected ? '#ff6b35' : '#2a2a3a'}`,
                        borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: '50%',
                          border: `2px solid ${isSelected ? '#ff6b35' : '#55556a'}`,
                          background: isSelected ? '#ff6b35' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {isSelected && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />}
                        </div>
                        <input
                          type="radio"
                          style={{ display: 'none' }}
                          checked={isSelected}
                          onChange={() => setSelectedOptions(prev => ({ ...prev, [group.name]: opt }))}
                        />
                        <span style={{ fontSize: 14, color: '#f4f4f6' }}>
                          {language === 'hi' && opt.label_hi ? opt.label_hi : opt.label}
                        </span>
                      </div>
                      <span style={{ fontSize: 13, color: opt.price_add > 0 ? '#f7c948' : '#9999b0' }}>
                        {opt.price_add > 0 ? `+₹${opt.price_add}` : 'Free'}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Special note */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#9999b0', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              {t.menu.specialNote}
            </p>
            <textarea
              id={`item-note-${item.id}`}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={t.menu.specialNote}
              rows={2}
              className="input-base"
              style={{ resize: 'none', lineHeight: 1.5 }}
            />
          </div>

          {/* Quantity + Add button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Qty selector */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 0,
              background: '#0f0f13', borderRadius: 12, border: '1px solid #2a2a3a',
              flexShrink: 0,
            }}>
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                style={{
                  width: 40, height: 44, background: 'transparent', border: 'none',
                  color: '#9999b0', fontSize: 18, cursor: 'pointer',
                }}
              >−</button>
              <span style={{ minWidth: 28, textAlign: 'center', fontSize: 16, fontWeight: 700, color: '#f4f4f6' }}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                style={{
                  width: 40, height: 44, background: 'transparent', border: 'none',
                  color: '#f4f4f6', fontSize: 18, cursor: 'pointer',
                }}
              >+</button>
            </div>

            {/* Add to order button */}
            <button
              id={`confirm-add-${item.id}`}
              onClick={handleAdd}
              className="btn-primary"
              style={{ flex: 1, justifyContent: 'space-between' }}
            >
              <span>{t.menu.addToOrder}</span>
              <span>₹{totalPrice % 1 === 0 ? totalPrice : totalPrice.toFixed(2)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
