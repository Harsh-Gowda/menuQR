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

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current
      const el = activeRef.current
      const scrollLeft = el.offsetLeft - (container.offsetWidth / 2) + (el.offsetWidth / 2)
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' })
    }
  }, [activeCategory])

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div
        ref={scrollRef}
        className="hide-scrollbar"
        style={{
          display: 'flex', overflowX: 'auto',
          gap: 6, padding: '12px 16px',
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
                padding: '8px 16px',
                borderRadius: 100,
                border: 'none',
                background: isActive
                  ? 'var(--text-primary)'
                  : 'var(--bg-surface)',
                color: isActive ? 'white' : 'var(--text-secondary)',
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                fontFamily: language === 'ar'
                  ? "'Cairo', 'Noto Sans Arabic', sans-serif"
                  : 'inherit',
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
