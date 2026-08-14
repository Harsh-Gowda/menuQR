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
      background: 'rgba(8,8,16,0.88)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
    }}>
      <div
        ref={scrollRef}
        className="hide-scrollbar"
        style={{
          display: 'flex', overflowX: 'auto',
          gap: 6, padding: '10px 14px',
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
                padding: '7px 16px',
                borderRadius: 20,
                border: isActive
                  ? '1.5px solid rgba(255,107,53,0.5)'
                  : '1.5px solid rgba(255,255,255,0.06)',
                background: isActive
                  ? 'rgba(255,107,53,0.12)'
                  : 'rgba(255,255,255,0.03)',
                color: isActive ? '#ff7a4a' : 'var(--text-secondary)',
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.18s',
                whiteSpace: 'nowrap',
                fontFamily: language === 'ar'
                  ? "'Cairo', 'Noto Sans Arabic', sans-serif"
                  : "'Inter', sans-serif",
                letterSpacing: isActive ? '-0.1px' : '0',
                boxShadow: isActive ? '0 0 12px rgba(255,107,53,0.15)' : 'none',
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
