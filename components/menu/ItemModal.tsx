'use client'

import { useEffect, useState } from 'react'
import { MenuItem, CartItem, CustomisationOption, Language } from '@/types'

interface ItemModalProps {
  item: MenuItem
  language: Language
  currency: string
  t: any
  onClose: () => void
  onAdd: (cartItem: CartItem) => void
}

export default function ItemModal({ item, language, currency, t, onClose, onAdd }: ItemModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<{ [groupName: string]: CustomisationOption }>({})
  const [notes, setNotes] = useState('')

  const isArabic = language === 'ar'
  const arabicFont = "'Cairo', 'Noto Sans Arabic', sans-serif"

  const name = isArabic && item.name_ar ? item.name_ar : item.name_en
  const desc = isArabic && item.description_ar ? item.description_ar : item.description_en

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

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      onClick={handleBackdrop}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        fontFamily: isArabic ? arabicFont : "'Inter', sans-serif",
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
                position: 'absolute', top: 12,
                [isArabic ? 'left' : 'right']: 12,
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
          <div style={{ display: 'flex', justifyContent: isArabic ? 'flex-start' : 'flex-end', padding: '12px 16px 0' }}>
            <button onClick={onClose} className="btn-ghost" style={{ padding: '6px 12px', fontSize: 13 }}>
              ✕ {t.menu.close}
            </button>
          </div>
        )}

        {/* Content */}
        <div style={{ padding: '20px 20px 24px' }}>
          {/* Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexDirection: isArabic ? 'row-reverse' : 'row' }}>
            {item.is_spicy && <span className="badge badge-red">🌶️ {isArabic ? 'حار' : 'Spicy'}</span>}
            {item.is_featured && <span className="badge badge-yellow">⭐ {isArabic ? 'الأكثر مبيعاً' : 'Best Seller'}</span>}
            {item.is_new && <span className="badge badge-blue">✨ {isArabic ? 'جديد' : 'New'}</span>}
            {item.is_veg && <span className="badge badge-green">🌱 {isArabic ? 'نباتي' : 'Veg'}</span>}
          </div>

          <h2 style={{
            fontSize: 20, fontWeight: 700, color: '#f4f4f6',
            margin: '0 0 4px',
            fontFamily: isArabic ? arabicFont : "'Inter', sans-serif",
            textAlign: isArabic ? 'right' : 'left',
          }}>
            {name}
          </h2>
          {/* Show secondary name */}
          {isArabic && item.name_en && (
            <p style={{ fontSize: 13, color: '#55556a', margin: '0 0 8px', textAlign: 'right', fontFamily: "'Inter', sans-serif" }}>{item.name_en}</p>
          )}
          {!isArabic && item.name_ar && (
            <p style={{ fontSize: 13, color: '#55556a', margin: '0 0 8px', fontFamily: arabicFont }}>{item.name_ar}</p>
          )}

          {desc && (
            <p style={{
              fontSize: 14, color: '#9999b0', lineHeight: 1.6, margin: '0 0 16px',
              textAlign: isArabic ? 'right' : 'left',
              fontFamily: isArabic ? arabicFont : "'Inter', sans-serif",
            }}>
              {desc}
            </p>
          )}

          {/* Allergens */}
          {item.allergens && item.allergens.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: '#9999b0', textAlign: isArabic ? 'right' : 'left' }}>
                ⚠️ {isArabic ? 'يحتوي على:' : 'Contains:'} {item.allergens.join(', ')}
              </p>
            </div>
          )}

          {/* Customisation groups */}
          {item.customisation_groups && item.customisation_groups.map(group => (
            <div key={group.name} style={{ marginBottom: 20 }}>
              <p style={{
                fontSize: 13, fontWeight: 700, color: '#9999b0',
                textTransform: 'uppercase', letterSpacing: isArabic ? 0 : '0.06em',
                marginBottom: 10, textAlign: isArabic ? 'right' : 'left',
              }}>
                {isArabic && group.name_ar ? group.name_ar : group.name}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {group.options.map(opt => {
                  const isSelected = selectedOptions[group.name]?.label === opt.label
                  return (
                    <label
                      key={opt.label}
                      style={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between',
                        flexDirection: isArabic ? 'row-reverse' : 'row',
                        padding: '10px 14px',
                        background: isSelected ? 'rgba(255,107,53,0.08)' : 'rgba(255,255,255,0.03)',
                        border: `1.5px solid ${isSelected ? '#ff6b35' : '#2a2a3a'}`,
                        borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexDirection: isArabic ? 'row-reverse' : 'row' }}>
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
                          {isArabic && opt.label_ar ? opt.label_ar : opt.label}
                        </span>
                      </div>
                      <span style={{ fontSize: 13, color: opt.price_add > 0 ? '#f7c948' : '#9999b0' }}>
                        {opt.price_add > 0 ? `+${currency} ${opt.price_add}` : (isArabic ? 'مجاناً' : 'Free')}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Special note */}
          <div style={{ marginBottom: 20 }}>
            <p style={{
              fontSize: 13, fontWeight: 700, color: '#9999b0',
              textTransform: 'uppercase', letterSpacing: isArabic ? 0 : '0.06em',
              marginBottom: 8, textAlign: isArabic ? 'right' : 'left',
            }}>
              {t.menu.specialNote}
            </p>
            <textarea
              id={`item-note-${item.id}`}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={t.menu.specialNote}
              rows={2}
              dir={isArabic ? 'rtl' : 'ltr'}
              className="input-base"
              style={{ resize: 'none', lineHeight: 1.5, textAlign: isArabic ? 'right' : 'left' }}
            />
          </div>

          {/* Quantity + Add button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexDirection: isArabic ? 'row-reverse' : 'row' }}>
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
              style={{ flex: 1, justifyContent: 'space-between', flexDirection: isArabic ? 'row-reverse' : 'row' }}
            >
              <span>{t.menu.addToOrder}</span>
              <span>{currency} {totalPrice % 1 === 0 ? totalPrice : totalPrice.toFixed(2)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
