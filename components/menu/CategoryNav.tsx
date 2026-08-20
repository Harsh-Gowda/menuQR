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
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div
        ref={scrollRef}
        className="hide-scrollbar"
        style={{
          display: 'flex', overflowX: 'auto',
          padding: '0 16px',
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
                padding: '16px 20px',
                border: 'none',
                background: 'transparent',
                color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                fontSize: 14,
                fontWeight: isActive ? 800 : 600,
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                whiteSpace: 'nowrap',
                position: 'relative',
              }}
            >
              {name}
              {isActive && (
                <div style={{
                  position: 'absolute', bottom: 0, left: '10%', right: '10%', height: 3,
                  background: 'var(--brand-primary)', borderRadius: '3px 3px 0 0'
                }} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
