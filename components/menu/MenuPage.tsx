'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Restaurant, MenuCategory, MenuItem, CartItem, Language, OrderType } from '@/types'
import { en } from '@/lib/translations/en'
import { ar } from '@/lib/translations/ar'
import CategoryNav from './CategoryNav'
import ItemCard from './ItemCard'
import ItemModal from './ItemModal'
import OrderSummary from './OrderSummary'
import { ShoppingCart } from 'lucide-react'

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
        body: JSON.stringify({ restaurantId: restaurant.id, tableNumber, source: tableNumber ? 'qr' : 'link', language }),
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
        { threshold: 0.1, rootMargin: '-100px 0px -40% 0px' }
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
      const existing = prev.findIndex(ci => ci.menuItem.id === item.menuItem.id && JSON.stringify(ci.selectedOptions) === JSON.stringify(item.selectedOptions))
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = { ...updated[existing], quantity: updated[existing].quantity + item.quantity, totalPrice: updated[existing].totalPrice + item.totalPrice }
        return updated
      }
      return [...prev, item]
    })
    setSelectedItem(null)
  }

  function removeFromCart(index: number) { setCart(prev => prev.filter((_, i) => i !== index)) }

  function updateCartQty(index: number, qty: number) {
    if (qty <= 0) { removeFromCart(index); return }
    setCart(prev => prev.map((ci, i) => i === index ? { ...ci, quantity: qty, totalPrice: (ci.totalPrice / ci.quantity) * qty } : ci))
  }

  const cartCount = cart.reduce((s, c) => s + c.quantity, 0)
  const subtotal = cart.reduce((s, c) => s + c.totalPrice, 0)
  const vatRate = restaurant?.gst_percentage ?? 5
  const vatAmount = restaurant?.gst_type === 'exclusive' ? (subtotal * vatRate) / 100 : 0
  const total = subtotal + vatAmount
  const currency = restaurant?.currency || 'AED'

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F5F5' }}><div className="animate-spin" style={{ fontSize: 40 }}>🍽️</div></div>
  if (!restaurant) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F5F5' }}><h1>Menu not found</h1></div>
  if (!restaurant.accept_orders) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F5F5' }}><h2>{t.menu.orderingPaused}</h2></div>

  const name = language === 'ar' && restaurant.name_ar ? restaurant.name_ar : restaurant.name_en

  return (
    <div
      className="menu-theme-light"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        maxWidth: 500, margin: '0 auto',
        background: 'var(--bg-base)', minHeight: '100vh', position: 'relative',
        paddingBottom: cartCount > 0 ? 120 : 60,
        fontFamily: isRTL ? "'Cairo', 'Noto Sans Arabic', sans-serif" : "inherit",
      }}
    >
      {/* ── Top Header (Mobile App Style) ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', background: 'var(--bg-card)', position: 'sticky', top: 0, zIndex: 30,
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Back/Logo Area */}
          {restaurant.logo_url ? (
            <img src={restaurant.logo_url} alt="Logo" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--brand-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>M</div>
          )}
          <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Our Menu</h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => setLanguage(l => l === 'en' ? 'ar' : 'en')} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            {language === 'en' ? 'AR' : 'EN'}
          </button>
          
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowOrderSummary(true)}>
            <ShoppingCart size={24} color="var(--text-primary)" />
            {cartCount > 0 && (
              <div style={{
                position: 'absolute', top: -6, right: -6,
                background: 'var(--brand-primary)', color: 'white',
                borderRadius: '50%', width: 16, height: 16,
                fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid var(--bg-card)'
              }}>{cartCount}</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Category Nav ── */}
      <div style={{ position: 'sticky', top: 68, zIndex: 20 }}>
        <CategoryNav
          categories={categories}
          items={items}
          activeCategory={activeCategory}
          language={language}
          onSelect={scrollToCategory}
        />
      </div>

      {/* ── Menu Items Grid ── */}
      <div style={{ padding: '24px 20px 0' }}>
        {categories.map(cat => {
          const catItems = items.filter(i => i.category_id === cat.id && i.is_available)
          if (catItems.length === 0) return null
          
          return (
            <div key={cat.id} ref={el => { categoryRefs.current[cat.id] = el }} style={{ scrollMarginTop: 140, marginBottom: 40 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                {catItems.map(item => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    language={language}
                    currency={currency}
                    onSelect={() => setSelectedItem(item)}
                    onQuickAdd={() => addToCart({ menuItem: item, quantity: 1, selectedOptions: {}, notes: '', totalPrice: item.price })}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom Floating Bar */}
      {cartCount > 0 && !showOrderSummary && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          width: 'calc(100% - 40px)', maxWidth: 460, zIndex: 40,
        }}>
          <button
            onClick={() => setShowOrderSummary(true)}
            style={{
              width: '100%', background: 'var(--brand-primary)', color: 'white',
              border: 'none', borderRadius: 'var(--radius-pill)', padding: '16px 24px',
              fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              boxShadow: '0 10px 25px rgba(217, 83, 79, 0.4)', cursor: 'pointer'
            }}
          >
            <span>Total: {currency} {total % 1 === 0 ? total : total.toFixed(2)}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShoppingCart size={18} /> View Cart
            </span>
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
