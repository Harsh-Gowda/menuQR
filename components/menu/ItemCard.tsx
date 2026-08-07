'use client'

import { MenuItem, Language } from '@/types'

interface ItemCardProps {
  item: MenuItem
  language: Language
  currency: string
  onSelect: () => void
  onQuickAdd: () => void
}

export default function ItemCard({ item, language, currency, onSelect, onQuickAdd }: ItemCardProps) {
  const isArabic = language === 'ar'
  const name = isArabic && item.name_ar ? item.name_ar : item.name_en
  const nameSecondary = isArabic ? item.name_en : (item.name_ar || null)
  const desc = isArabic && item.description_ar ? item.description_ar : item.description_en
  const hasOptions = item.customisation_groups && item.customisation_groups.length > 0

  const arabicFont = "'Cairo', 'Noto Sans Arabic', sans-serif"

  return (
    <div
      className="menu-card"
      onClick={onSelect}
      style={{
        display: 'flex',
        flexDirection: isArabic ? 'row-reverse' : 'row',
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
      {/* Text content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Badges row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4, flexWrap: 'wrap', flexDirection: isArabic ? 'row-reverse' : 'row' }}>
          {item.is_featured && (
            <span className="badge badge-yellow">⭐ {isArabic ? 'الأكثر مبيعاً' : 'Best Seller'}</span>
          )}
          {item.is_new && (
            <span className="badge badge-blue">✨ {isArabic ? 'جديد' : 'New'}</span>
          )}
          {item.is_spicy && (
            <span className="badge badge-red">🌶️ {isArabic ? 'حار' : 'Spicy'}</span>
          )}
          {item.is_veg && (
            <span className="badge badge-green">🌱 {isArabic ? 'نباتي' : 'Veg'}</span>
          )}
        </div>

        {/* Name */}
        <h3 style={{
          fontSize: 15,
          fontWeight: 700,
          color: '#f4f4f6',
          margin: '0 0 2px',
          lineHeight: 1.3,
          fontFamily: isArabic ? arabicFont : 'Inter, sans-serif',
          textAlign: isArabic ? 'right' : 'left',
        }}>
          {name}
        </h3>
        {nameSecondary && (
          <p style={{
            fontSize: 12,
            color: '#55556a',
            margin: '0 0 4px',
            lineHeight: 1.3,
            textAlign: isArabic ? 'right' : 'left',
            fontFamily: isArabic ? 'Inter, sans-serif' : arabicFont,
          }}>
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
            textAlign: isArabic ? 'right' : 'left',
            fontFamily: isArabic ? arabicFont : 'Inter, sans-serif',
          }}>
            {desc}
          </p>
        )}

        {/* Price row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexDirection: isArabic ? 'row-reverse' : 'row',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#f4f4f6' }}>
              {currency} {item.price}
            </span>
            {item.original_price && item.original_price > item.price && (
              <span style={{ fontSize: 13, color: '#55556a', textDecoration: 'line-through' }}>
                {currency} {item.original_price}
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

      {/* Image */}
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
            {isArabic ? 'نفد المخزون' : 'Sold Out'}
          </span>
        </div>
      )}
    </div>
  )
}
