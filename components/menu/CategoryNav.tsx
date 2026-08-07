'use client'

import { useRef, useEffect } from 'react'
import { MenuCategory, MenuItem, Language } from '@/types'

interface CategoryNavProps {
  categories: MenuCategory[]
  items: MenuItem[]
  activeCategory: string
  language: Language
  onSelect: (id: string) => void
}

export default function CategoryNav({ categories, items, activeCategory, language, onSelect }: CategoryNavProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  // Auto-scroll active tab into view
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current
      const el = activeRef.current
      const elLeft = el.offsetLeft
      const elWidth = el.offsetWidth
      const containerWidth = container.offsetWidth
      const scrollLeft = elLeft - (containerWidth / 2) + (elWidth / 2)
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' })
    }
  }, [activeCategory])

  return (
    <div style={{
      background: 'rgba(15,15,19,0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #2a2a3a',
    }}>
      <div
        ref={scrollRef}
        className="hide-scrollbar"
        style={{
          display: 'flex',
          overflowX: 'auto',
          gap: 4,
          padding: '10px 12px',
        }}
      >
        {categories.map(cat => {
          const isActive = cat.id === activeCategory
          const name = language === 'ar' && cat.name_ar ? cat.name_ar : cat.name_en
          const catItems = items.filter(i => i.category_id === cat.id && i.is_available)
          if (catItems.length === 0) return null

          return (
            <button
              key={cat.id}
              ref={isActive ? activeRef : null}
              onClick={() => onSelect(cat.id)}
              style={{
                flexShrink: 0,
                padding: '7px 14px',
                borderRadius: 20,
                border: isActive ? '1.5px solid #ff6b35' : '1.5px solid transparent',
                background: isActive ? 'rgba(255,107,53,0.12)' : 'rgba(255,255,255,0.04)',
                color: isActive ? '#ff6b35' : '#9999b0',
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                fontFamily: language === 'ar' ? "'Cairo', 'Noto Sans Arabic', sans-serif" : "'Inter', sans-serif",
              }}
            >
              {name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
