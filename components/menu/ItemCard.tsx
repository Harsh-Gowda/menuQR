'use client'

import { MenuItem, Language } from '@/types'
import { Plus } from 'lucide-react'

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
  const desc = isArabic && item.description_ar ? item.description_ar : item.description_en
  const hasOptions = item.customisation_groups && item.customisation_groups.length > 0
  const arabicFont = "'Cairo', 'Noto Sans Arabic', sans-serif"
  const hasDiscount = item.original_price && item.original_price > item.price
  const discountPct = hasDiscount ? Math.round(100 - (item.price / item.original_price!) * 100) : 0

  return (
    <div
      className="card"
      onClick={onSelect}
      style={{
        display: 'flex',
        flexDirection: isArabic ? 'row-reverse' : 'row',
        gap: 14,
        padding: 14,
        marginBottom: 12,
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle left accent for veg */}
      {item.is_veg && (
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
          background: '#22c55e',
        }} />
      )}

      {/* Text content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Badges */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
          flexWrap: 'wrap', flexDirection: isArabic ? 'row-reverse' : 'row',
        }}>
          {item.is_featured && (
            <span style={{
              fontSize: 10, fontWeight: 800, letterSpacing: '0.04em',
              background: '#fef3c7', color: '#b45309',
              borderRadius: 6, padding: '2px 8px',
            }}>⭐ BEST SELLER</span>
          )}
          {item.is_new && (
            <span style={{
              fontSize: 10, fontWeight: 800, letterSpacing: '0.04em',
              background: 'var(--brand-primary-light)', color: 'var(--brand-primary)',
              borderRadius: 6, padding: '2px 8px',
            }}>✨ NEW</span>
          )}
          {item.is_spicy && <span style={{ fontSize: 13 }}>🌶️</span>}
        </div>

        {/* Name */}
        <h3 style={{
          fontSize: 16, fontWeight: 700, color: 'var(--text-primary)',
          margin: '0 0 6px', lineHeight: 1.3,
          fontFamily: isArabic ? arabicFont : 'inherit',
          textAlign: isArabic ? 'right' : 'left',
          letterSpacing: '-0.2px',
        }}>{name}</h3>

        {/* Description */}
        {desc && (
          <p style={{
            fontSize: 14, color: 'var(--text-secondary)',
            margin: '0 0 12px', lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
            textAlign: isArabic ? 'right' : 'left',
            fontFamily: isArabic ? arabicFont : 'inherit',
          }}>{desc}</p>
        )}

        {/* Price row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexDirection: isArabic ? 'row-reverse' : 'row',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              {currency} {item.price}
            </span>
            {hasDiscount && (
              <>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  {currency} {item.original_price}
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: '#166534',
                  background: '#dcfce7',
                  borderRadius: 6, padding: '2px 8px',
                }}>{discountPct}% OFF</span>
              </>
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
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)', borderRadius: 10,
              width: 36, height: 36,
              color: 'var(--text-primary)',
              cursor: 'pointer', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--border)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-surface)'}
          >
            <Plus size={20} strokeWidth={2.5} />
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
              width: 96, height: 96, borderRadius: 'var(--radius-md)',
              objectFit: 'cover', display: 'block',
              border: '1px solid var(--border)',
            }}
          />
        </div>
      )}

      {/* Sold out overlay */}
      {!item.is_available && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(255,255,255,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(2px)', zIndex: 10,
        }}>
          <span style={{
            color: '#b91c1c', fontWeight: 700, fontSize: 13,
            background: '#fef2f2', borderRadius: 8, padding: '6px 14px',
            border: '1px solid #fca5a5',
          }}>
            {isArabic ? 'نفد المخزون' : 'Sold Out'}
          </span>
        </div>
      )}
    </div>
  )
}
