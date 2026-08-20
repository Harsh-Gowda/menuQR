'use client'

import { MenuItem, Language } from '@/types'
import { Plus, Heart } from 'lucide-react'

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
  const hasOptions = item.customisation_groups && item.customisation_groups.length > 0

  return (
    <div
      onClick={onSelect}
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
        padding: '16px',
        cursor: 'pointer',
        position: 'relative',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', textAlign: 'center',
        height: '100%',
        transition: 'transform 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {/* Favorite Heart Icon (Top Right) */}
      <div style={{ position: 'absolute', top: 12, right: 12, color: 'var(--brand-primary)' }}>
        <Heart size={16} strokeWidth={2.5} />
      </div>

      {/* Veg Indicator (Top Left) */}
      {item.is_veg && (
        <div style={{ position: 'absolute', top: 12, left: 12, width: 8, height: 8, borderRadius: '50%', background: '#16A34A' }} />
      )}

      {/* Circular Food Image */}
      <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--bg-surface)', marginBottom: 16, overflow: 'hidden' }}>
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name_en}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🍽️</div>
        )}
      </div>

      {/* Name */}
      <h3 style={{
        fontSize: 14, fontWeight: 700, color: 'var(--text-primary)',
        margin: '0 0 8px', lineHeight: 1.3,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
      }}>{name}</h3>

      {/* Price */}
      <div style={{
        fontSize: 15, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em',
        marginTop: 'auto', marginBottom: 12
      }}>
        {currency} {item.price}
      </div>

      {/* Add button inside card if no options, else just rely on card click */}
      {!hasOptions && (
        <button
          onClick={e => {
            e.stopPropagation()
            onQuickAdd()
          }}
          style={{
            position: 'absolute', bottom: -12, left: '50%', transform: 'translateX(-50%)',
            background: 'var(--brand-primary)', color: 'white',
            border: 'none', borderRadius: 'var(--radius-pill)',
            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(217, 83, 79, 0.3)', cursor: 'pointer', transition: 'transform 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateX(-50%) scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateX(-50%) scale(1)'}
        >
          <Plus size={18} strokeWidth={3} />
        </button>
      )}

      {/* Sold out overlay */}
      {!item.is_available && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(255, 255, 255, 0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(2px)', zIndex: 10,
          borderRadius: 'var(--radius-xl)'
        }}>
          <span style={{
            color: 'white', fontWeight: 800, fontSize: 12,
            background: 'var(--text-primary)', borderRadius: 'var(--radius-pill)', padding: '6px 12px',
          }}>
            Sold Out
          </span>
        </div>
      )}
    </div>
  )
}
