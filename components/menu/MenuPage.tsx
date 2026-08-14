'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Restaurant, MenuCategory, MenuItem, CartItem, Language, OrderType } from '@/types'
import { en } from '@/lib/translations/en'
import { ar } from '@/lib/translations/ar'
import CategoryNav from './CategoryNav'
import ItemCard from './ItemCard'
import ItemModal from './ItemModal'
import OrderSummary from './OrderSummary'

interface MenuPageProps {
  slug: string
  tableNumber?: string
}

export default function MenuPage({ slug, tableNumber }: MenuPageProps) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState<Language>('en')
  const [cart, setCart] = useState<CartItem[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [showOrderSummary, setShowOrderSummary] = useState(false)
  const categoryRefs = useRef<{ [id: string]: HTMLDivElement | null }>({})

  const t = language === 'ar' ? ar : en
  const isRTL = language === 'ar'

  // Fetch menu data
  useEffect(() => {
    fetch(`/api/menu/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.restaurant) {
          setRestaurant(data.restaurant)
          setCategories(data.categories)
          setItems(data.items)
          const defaultLang = data.restaurant.default_language || 'en'
          setLanguage(defaultLang === 'hi' ? 'en' : defaultLang)
          if (data.categories.length > 0) setActiveCategory(data.categories[0].id)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  // Track view
  useEffect(() => {
    if (restaurant) {
      fetch('/api/views/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          tableNumber,
          source: tableNumber ? 'qr' : 'link',
          language,
        }),
      }).catch(() => {})
    }
  }, [restaurant, tableNumber, language])

  // Intersection observer for active category
  useEffect(() => {
    if (categories.length === 0) return
    const observers: IntersectionObserver[] = []
    categories.forEach(cat => {
      const el = categoryRefs.current[cat.id]
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveCategory(cat.id) },
        { threshold: 0.3, rootMargin: '-80px 0px 0px 0px' }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [categories])

  const scrollToCategory = useCallback((catId: string) => {
    setActiveCategory(catId)
    const el = categoryRefs.current[catId]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  function addToCart(item: CartItem) {
    setCart(prev => {
      const existing = prev.findIndex(
        ci => ci.menuItem.id === item.menuItem.id &&
          JSON.stringify(ci.selectedOptions) === JSON.stringify(item.selectedOptions)
      )
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = {
          ...updated[existing],
          quantity: updated[existing].quantity + item.quantity,
          totalPrice: updated[existing].totalPrice + item.totalPrice,
        }
        return updated
      }
      return [...prev, item]
    })
    setSelectedItem(null)
  }

  function removeFromCart(index: number) {
    setCart(prev => prev.filter((_, i) => i !== index))
  }

  function updateCartQty(index: number, qty: number) {
    if (qty <= 0) { removeFromCart(index); return }
    setCart(prev => prev.map((ci, i) => i === index
      ? { ...ci, quantity: qty, totalPrice: (ci.totalPrice / ci.quantity) * qty }
      : ci
    ))
  }

  const cartCount = cart.reduce((s, c) => s + c.quantity, 0)
  const subtotal = cart.reduce((s, c) => s + c.totalPrice, 0)
  const vatRate = restaurant?.gst_percentage ?? 5
  const vatAmount = restaurant?.gst_type === 'exclusive' ? (subtotal * vatRate) / 100 : 0
  const total = subtotal + vatAmount

  // Currency symbol
  const currency = restaurant?.currency || 'AED'

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#0f0f13',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12, animation: 'pulse 1.5s infinite' }}>🍽️</div>
          <p style={{ color: '#9999b0', fontSize: 15 }}>Loading menu…</p>
        </div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#0f0f13', textAlign: 'center', padding: 24,
      }}>
        <div>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🍽️</div>
          <h1 style={{ color: '#f4f4f6', fontSize: 22, marginBottom: 8 }}>Menu not found</h1>
          <p style={{ color: '#9999b0' }}>This restaurant doesn&apos;t exist or the link may be incorrect.</p>
        </div>
      </div>
    )
  }

  if (!restaurant.accept_orders) {
    return (
      <div
        dir={isRTL ? 'rtl' : 'ltr'}
        style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: '#0f0f13', textAlign: 'center', padding: 24,
        }}
      >
        <div>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏸️</div>
          <h2 style={{ color: '#f4f4f6', fontSize: 22, marginBottom: 8 }}>{t.menu.orderingPaused}</h2>
          <p style={{ color: '#9999b0' }}>{t.menu.orderingPausedMsg}</p>
        </div>
      </div>
    )
  }

  const name = language === 'ar' && restaurant.name_ar ? restaurant.name_ar : restaurant.name_en

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        maxWidth: 480,
        margin: '0 auto',
        background: 'var(--bg-base)',
        minHeight: '100vh',
        position: 'relative',
        paddingBottom: cartCount > 0 ? 100 : 40,
        fontFamily: isRTL ? "'Cairo', 'Noto Sans Arabic', sans-serif" : "'Inter', sans-serif",
      }}
    >
      {/* ── Header ── */}
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '0 0 0',
      }}>
        {/* Cover image with gradient overlay */}
        {restaurant.cover_image_url ? (
          <div style={{ position: 'relative', height: 140 }}>
            <img
              src={restaurant.cover_image_url}
              alt={restaurant.name_en}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, rgba(8,8,16,0.2) 0%, rgba(8,8,16,0.95) 100%)',
            }} />
          </div>
        ) : (
          <div style={{
            height: 80,
            background: 'linear-gradient(135deg,rgba(255,107,53,0.08),rgba(99,102,241,0.06))',
          }} />
        )}

        {/* Restaurant info */}
        <div style={{
          padding: restaurant.cover_image_url ? '0 20px 20px' : '20px 20px 20px',
          marginTop: restaurant.cover_image_url ? -60 : 0,
          position: 'relative', zIndex: 1,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
              {/* Logo */}
              {restaurant.logo_url ? (
                <img
                  src={restaurant.logo_url}
                  alt={restaurant.name_en}
                  style={{
                    width: 60, height: 60, borderRadius: 16, objectFit: 'cover',
                    border: '3px solid var(--bg-base)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div style={{
                  width: 60, height: 60, borderRadius: 16,
                  background: 'linear-gradient(135deg,#ff6b35,#f7c948)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, flexShrink: 0,
                  border: '3px solid var(--bg-base)',
                  boxShadow: '0 8px 24px rgba(255,107,53,0.3)',
                }}>🍽️</div>
              )}

              <div>
                <h1 style={{
                  fontSize: 21, fontWeight: 800, color: '#f0f0ff', margin: 0,
                  letterSpacing: '-0.4px', lineHeight: 1.2,
                  fontFamily: isRTL ? "'Cairo', 'Noto Sans Arabic', sans-serif" : "'Inter', sans-serif",
                }}>
                  {name}
                </h1>
                {restaurant.area && (
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '3px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                    📍 {restaurant.area}
                  </p>
                )}
                {/* Order status indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite', display: 'inline-block' }} />
                  <span style={{ fontSize: 12, color: '#4ade80', fontWeight: 600 }}>Accepting orders</span>
                </div>
              </div>
            </div>

            {/* Language toggle */}
            <button
              id="language-toggle"
              onClick={() => setLanguage(l => l === 'en' ? 'ar' : 'en')}
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 20, padding: '7px 14px',
                color: '#f0f0ff', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                backdropFilter: 'blur(8px)',
                transition: 'background 0.15s',
              }}
            >
              {language === 'en' ? '🇦🇪 عربي' : '🇬🇧 EN'}
            </button>
          </div>
        </div>
      </div>

      {/* Category nav */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        <CategoryNav
          categories={categories}
          items={items}
          activeCategory={activeCategory}
          language={language}
          onSelect={scrollToCategory}
        />
      </div>

      {/* Menu items by category */}
      <div style={{ padding: '8px 16px 0' }}>
        {categories.map(cat => {
          const catItems = items.filter(i => i.category_id === cat.id && i.is_available)
          if (catItems.length === 0) return null
          const catName = language === 'ar' && cat.name_ar ? cat.name_ar : cat.name_en
          return (
            <div
              key={cat.id}
              ref={el => { categoryRefs.current[cat.id] = el }}
              style={{ marginBottom: 8, scrollMarginTop: 120 }}
            >
              <div style={{ padding: '20px 0 12px', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h2 style={{
                  fontSize: 13, fontWeight: 800, color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: isRTL ? '0' : '0.1em',
                  margin: 0,
                  fontFamily: isRTL ? "'Cairo', 'Noto Sans Arabic', sans-serif" : "'Inter', sans-serif",
                }}>{catName}</h2>
              </div>
              {catItems.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  language={language}
                  currency={currency}
                  onSelect={() => setSelectedItem(item)}
                  onQuickAdd={() => addToCart({
                    menuItem: item,
                    quantity: 1,
                    selectedOptions: {},
                    notes: '',
                    totalPrice: item.price,
                  })}
                />
              ))}
            </div>
          )
        })}
      </div>

      {/* Floating cart bar */}
      {cartCount > 0 && !showOrderSummary && (
        <div
          className="animate-slide-up"
          style={{
            position: 'fixed', bottom: 0, left: '50%',
            transform: 'translateX(-50%)',
            width: '100%', maxWidth: 480,
            padding: '12px 16px 16px',
            background: 'rgba(8,8,16,0.85)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            zIndex: 40,
          }}
        >
          <button
            id="view-cart-btn"
            onClick={() => setShowOrderSummary(true)}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg,#ff6b35,#e85520)',
              border: 'none', borderRadius: 16,
              padding: '14px 20px', color: 'white',
              fontSize: 16, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontFamily: isRTL ? "'Cairo', 'Noto Sans Arabic', sans-serif" : "'Inter', sans-serif",
              boxShadow: '0 4px 24px rgba(255,107,53,0.4)',
              letterSpacing: '-0.2px',
            }}
          >
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: 8, padding: '2px 10px', fontSize: 14, fontWeight: 800,
            }}>
              {cartCount}
            </span>
            <span>{t.menu.viewOrder} 🛒</span>
            <span style={{ fontWeight: 800 }}>{currency} {total % 1 === 0 ? total : total.toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* Item modal */}
      {selectedItem && (
        <ItemModal
          item={selectedItem}
          language={language}
          currency={currency}
          t={t}
          onClose={() => setSelectedItem(null)}
          onAdd={addToCart}
        />
      )}

      {/* Order summary */}
      {showOrderSummary && (
        <OrderSummary
          cart={cart}
          restaurant={restaurant}
          tableNumber={tableNumber}
          language={language}
          t={t}
          currency={currency}
          subtotal={subtotal}
          vatAmount={vatAmount}
          vatRate={vatRate}
          total={total}
          onClose={() => setShowOrderSummary(false)}
          onUpdateQty={updateCartQty}
          onRemove={removeFromCart}
          onClearCart={() => { setCart([]); setShowOrderSummary(false) }}
        />
      )}
    </div>
  )
}
