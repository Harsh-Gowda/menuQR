'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Restaurant, MenuCategory, MenuItem, CartItem, Language, OrderType } from '@/types'
import { en } from '@/lib/translations/en'
import { hi } from '@/lib/translations/hi'
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
  const [showCart, setShowCart] = useState(false)
  const [showOrderSummary, setShowOrderSummary] = useState(false)
  const categoryRefs = useRef<{ [id: string]: HTMLDivElement | null }>({})

  const t = language === 'hi' ? hi : en

  // Fetch menu data
  useEffect(() => {
    fetch(`/api/menu/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.restaurant) {
          setRestaurant(data.restaurant)
          setCategories(data.categories)
          setItems(data.items)
          setLanguage(data.restaurant.default_language || 'en')
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
      const key = item.menuItem.id + JSON.stringify(item.selectedOptions)
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
  const gstRate = restaurant?.gst_percentage ?? 5
  const gstAmount = restaurant?.gst_type === 'exclusive' ? (subtotal * gstRate) / 100 : 0
  const total = subtotal + gstAmount

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
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#0f0f13', textAlign: 'center', padding: 24,
      }}>
        <div>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏸️</div>
          <h2 style={{ color: '#f4f4f6', fontSize: 22, marginBottom: 8 }}>{t.menu.orderingPaused}</h2>
          <p style={{ color: '#9999b0' }}>{t.menu.orderingPausedMsg}</p>
        </div>
      </div>
    )
  }

  const name = language === 'hi' && restaurant.name_hi ? restaurant.name_hi : restaurant.name_en

  return (
    <div style={{
      maxWidth: 480,
      margin: '0 auto',
      background: '#0f0f13',
      minHeight: '100vh',
      position: 'relative',
      paddingBottom: cartCount > 0 ? 100 : 32,
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(180deg, #1a1a24 0%, #0f0f13 100%)',
        padding: '24px 20px 16px',
        position: 'relative',
      }}>
        {/* Cover image */}
        {restaurant.cover_image_url && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0,
            backgroundImage: `url(${restaurant.cover_image_url})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            opacity: 0.15,
          }} />
        )}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            {/* Logo + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {restaurant.logo_url ? (
                <img
                  src={restaurant.logo_url}
                  alt={restaurant.name_en}
                  style={{ width: 52, height: 52, borderRadius: 12, objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: 52, height: 52, borderRadius: 12,
                  background: 'linear-gradient(135deg, #ff6b35, #f7c948)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24,
                }}>
                  🍽️
                </div>
              )}
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 700, color: '#f4f4f6', margin: 0 }}>
                  {name}
                </h1>
                {restaurant.area && (
                  <p style={{ fontSize: 13, color: '#9999b0', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                    📍 {restaurant.area}
                  </p>
                )}
                {restaurant.is_veg_only && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 11, fontWeight: 600, color: '#22c55e',
                    background: 'rgba(34,197,94,0.1)', borderRadius: 20, padding: '2px 8px', marginTop: 4,
                  }}>
                    🌿 Pure Veg
                  </span>
                )}
              </div>
            </div>

            {/* Language toggle */}
            <button
              id="language-toggle"
              onClick={() => setLanguage(l => l === 'en' ? 'hi' : 'en')}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 20,
                padding: '6px 14px',
                color: '#f4f4f6',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {language === 'en' ? '🇮🇳 हिंदी' : '🇬🇧 English'}
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
          const catName = language === 'hi' && cat.name_hi ? cat.name_hi : cat.name_en
          return (
            <div
              key={cat.id}
              ref={el => { categoryRefs.current[cat.id] = el }}
              style={{ marginBottom: 8, scrollMarginTop: 120 }}
            >
              <h2 style={{
                fontSize: 15,
                fontWeight: 700,
                color: '#9999b0',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                padding: '20px 0 10px',
                margin: 0,
                borderBottom: '1px solid #2a2a3a',
                marginBottom: 12,
                fontFamily: language === 'hi' ? 'Noto Sans Devanagari, sans-serif' : 'Inter, sans-serif',
              }}>
                {catName}
              </h2>
              {catItems.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  language={language}
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
            padding: '12px 16px',
            background: '#1a1a24',
            borderTop: '1px solid #2a2a3a',
            zIndex: 40,
          }}
        >
          <button
            id="view-cart-btn"
            onClick={() => setShowOrderSummary(true)}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #ff6b35, #e85520)',
              border: 'none',
              borderRadius: 14,
              padding: '14px 20px',
              color: 'white',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: 8,
              padding: '2px 10px',
              fontSize: 14,
            }}>
              {cartCount} {cartCount === 1 ? t.menu.item : t.menu.items}
            </span>
            <span>{t.menu.viewOrder}</span>
            <span>₹{total % 1 === 0 ? total : total.toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* Item modal */}
      {selectedItem && (
        <ItemModal
          item={selectedItem}
          language={language}
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
          subtotal={subtotal}
          gstAmount={gstAmount}
          gstRate={gstRate}
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
