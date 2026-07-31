'use client'

import { MenuItem, Language } from '@/types'

interface ItemCardProps {
  item: MenuItem
  language: Language
  onSelect: () => void
  onQuickAdd: () => void
}

export default function ItemCard({ item, language, onSelect, onQuickAdd }: ItemCardProps) {
  const name = language === 'hi' && item.name_hi ? item.name_hi : item.name_en
  const nameSecondary = language === 'hi' && item.name_hi ? item.name_en : item.name_hi
  const desc = language === 'hi' && item.description_hi ? item.description_hi : item.description_en
  const hasOptions = item.customisation_groups && item.customisation_groups.length > 0

  return (
    <div
      className="menu-card"
      onClick={onSelect}
      style={{
        display: 'flex',
        gap: 12,
        background: '#1a1a24',
        border: '1px solid #2a2a3a',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Left — text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Veg/NonVeg dot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          {item.is_veg ? (
            <div className="veg-dot" title="Vegetarian" />
          ) : (
            <div className="nonveg-dot" title="Non-Vegetarian" />
          )}
          {item.is_jain && (
            <span style={{
              fontSize: 10, fontWeight: 600, color: '#a78bfa',
              background: 'rgba(167,139,250,0.1)', borderRadius: 20, padding: '1px 7px',
            }}>Jain</span>
          )}
          {/* Badges */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {item.is_featured && <span className="badge badge-yellow">⭐ {language === 'hi' ? 'बेस्ट सेलर' : 'Best Seller'}</span>}
            {item.is_new && <span className="badge badge-blue">✨ {language === 'hi' ? 'नया' : 'New'}</span>}
            {item.is_spicy && <span className="badge badge-red">🌶️ {language === 'hi' ? 'तीखा' : 'Spicy'}</span>}
          </div>
        </div>

        {/* Name */}
        <h3 style={{
          fontSize: 15,
          fontWeight: 700,
          color: '#f4f4f6',
          margin: '0 0 2px',
          lineHeight: 1.3,
          fontFamily: language === 'hi' ? 'Noto Sans Devanagari, sans-serif' : 'Inter, sans-serif',
        }}>
          {name}
        </h3>
        {nameSecondary && (
          <p style={{ fontSize: 12, color: '#55556a', margin: '0 0 6px', lineHeight: 1.3 }}>
            {nameSecondary}
          </p>
        )}

        {/* Description */}
        {desc && (
          <p style={{
            fontSize: 13,
            color: '#9999b0',
            margin: '0 0 10px',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {desc}
          </p>
        )}

        {/* Price row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#f4f4f6' }}>
              ₹{item.price}
            </span>
            {item.original_price && item.original_price > item.price && (
              <span style={{ fontSize: 13, color: '#55556a', textDecoration: 'line-through' }}>
                ₹{item.original_price}
              </span>
            )}
          </div>

          {/* Add button */}
          <button
            id={`add-item-${item.id}`}
            onClick={e => {
              e.stopPropagation()
              if (hasOptions) onSelect()
              else onQuickAdd()
            }}
            style={{
              background: 'linear-gradient(135deg, #ff6b35, #e85520)',
              border: 'none',
              borderRadius: 10,
              width: 36,
              height: 36,
              color: 'white',
              fontSize: 20,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'transform 0.1s',
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* Right — image */}
      {item.image_url && (
        <div style={{ flexShrink: 0 }}>
          <img
            src={item.image_url}
            alt={item.name_en}
            style={{
              width: 90,
              height: 90,
              borderRadius: 10,
              objectFit: 'cover',
            }}
          />
        </div>
      )}

      {/* Sold out overlay */}
      {!item.is_available && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(15,15,19,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 14,
        }}>
          <span style={{ color: '#9999b0', fontWeight: 700, fontSize: 14 }}>
            {language === 'hi' ? 'स्टॉक खत्म' : 'Sold Out'}
          </span>
        </div>
      )}
    </div>
  )
}
