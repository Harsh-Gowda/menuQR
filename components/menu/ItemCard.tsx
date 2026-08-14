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
  const desc = isArabic && item.description_ar ? item.description_ar : item.description_en
  const hasOptions = item.customisation_groups && item.customisation_groups.length > 0
  const arabicFont = "'Cairo', 'Noto Sans Arabic', sans-serif"
  const hasDiscount = item.original_price && item.original_price > item.price
  const discountPct = hasDiscount ? Math.round(100 - (item.price / item.original_price!) * 100) : 0

  return (
    <div
      className="menu-card"
      onClick={onSelect}
      style={{
        display: 'flex',
        flexDirection: isArabic ? 'row-reverse' : 'row',
        gap: 14,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 18,
        padding: '14px 14px',
        marginBottom: 10,
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.2s, border-color 0.2s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.05)'
        ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,107,53,0.2)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)'
        ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)'
      }}
    >
      {/* Subtle left accent for veg */}
      {item.is_veg && (
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
          background: 'linear-gradient(180deg,#22c55e,transparent)',
          borderRadius: '18px 0 0 18px',
        }} />
      )}

      {/* Text content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Badges */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6,
          flexWrap: 'wrap', flexDirection: isArabic ? 'row-reverse' : 'row',
        }}>
          {item.is_featured && (
            <span style={{
              fontSize: 10, fontWeight: 800, letterSpacing: '0.04em',
              background: 'rgba(247,201,72,0.12)', color: '#facc15',
              border: '1px solid rgba(247,201,72,0.2)', borderRadius: 6, padding: '2px 8px',
            }}>⭐ BEST SELLER</span>
          )}
          {item.is_new && (
            <span style={{
              fontSize: 10, fontWeight: 800, letterSpacing: '0.04em',
              background: 'rgba(99,102,241,0.12)', color: '#818cf8',
              border: '1px solid rgba(99,102,241,0.2)', borderRadius: 6, padding: '2px 8px',
            }}>✨ NEW</span>
          )}
          {item.is_spicy && <span style={{ fontSize: 13 }}>🌶️</span>}
        </div>

        {/* Name */}
        <h3 style={{
          fontSize: 15, fontWeight: 700, color: '#f0f0ff',
          margin: '0 0 4px', lineHeight: 1.35,
          fontFamily: isArabic ? arabicFont : 'Inter, sans-serif',
          textAlign: isArabic ? 'right' : 'left',
          letterSpacing: '-0.2px',
        }}>{name}</h3>

        {/* Description */}
        {desc && (
          <p style={{
            fontSize: 13, color: 'rgba(144,144,176,0.8)',
            margin: '0 0 10px', lineHeight: 1.55,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
            textAlign: isArabic ? 'right' : 'left',
            fontFamily: isArabic ? arabicFont : 'Inter, sans-serif',
          }}>{desc}</p>
        )}

        {/* Price row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexDirection: isArabic ? 'row-reverse' : 'row',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: '#f0f0ff', letterSpacing: '-0.3px' }}>
              {currency} {item.price}
            </span>
            {hasDiscount && (
              <>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  {currency} {item.original_price}
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 800, color: '#4ade80',
                  background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                  borderRadius: 6, padding: '1px 6px',
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
              background: 'linear-gradient(135deg,#ff6b35,#e85520)',
              border: 'none', borderRadius: 10,
              width: 34, height: 34,
              color: 'white', fontSize: 20, fontWeight: 700,
              cursor: 'pointer', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'transform 0.1s, box-shadow 0.1s',
              boxShadow: '0 2px 12px rgba(255,107,53,0.35)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)'
              ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(255,107,53,0.5)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
              ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 12px rgba(255,107,53,0.35)'
            }}
          >+</button>
        </div>
      </div>

      {/* Image */}
      {item.image_url && (
        <div style={{ flexShrink: 0 }}>
          <img
            src={item.image_url}
            alt={item.name_en}
            style={{
              width: 88, height: 88, borderRadius: 14,
              objectFit: 'cover', display: 'block',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            }}
          />
        </div>
      )}

      {/* Sold out overlay */}
      {!item.is_available && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(8,8,16,0.82)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 18,
          backdropFilter: 'blur(2px)',
        }}>
          <span style={{
            color: 'var(--text-muted)', fontWeight: 700, fontSize: 13,
            background: 'rgba(0,0,0,0.5)', borderRadius: 8, padding: '5px 14px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            {isArabic ? 'نفد المخزون' : 'Sold Out'}
          </span>
        </div>
      )}
    </div>
  )
}
