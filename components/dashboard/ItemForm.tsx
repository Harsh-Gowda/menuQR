'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MenuItem } from '@/types'

interface ItemFormProps {
  restaurantId: string
  categoryId: string
  item: MenuItem | null
  onClose: () => void
  onSaved: () => void
}

export default function ItemForm({ restaurantId, categoryId, item, onClose, onSaved }: ItemFormProps) {
  const supabase = createClient()
  const [nameEn, setNameEn] = useState(item?.name_en || '')
  const [nameHi, setNameHi] = useState(item?.name_hi || '')
  const [descEn, setDescEn] = useState(item?.description_en || '')
  const [descHi, setDescHi] = useState(item?.description_hi || '')
  const [price, setPrice] = useState(item?.price?.toString() || '')
  const [originalPrice, setOriginalPrice] = useState(item?.original_price?.toString() || '')
  const [imageUrl, setImageUrl] = useState(item?.image_url || '')
  const [isVeg, setIsVeg] = useState(item?.is_veg ?? true)
  const [isJain, setIsJain] = useState(item?.is_jain ?? false)
  const [isSpicy, setIsSpicy] = useState(item?.is_spicy ?? false)
  const [isNew, setIsNew] = useState(item?.is_new ?? false)
  const [isFeatured, setIsFeatured] = useState(item?.is_featured ?? false)
  const [isAvailable, setIsAvailable] = useState(item?.is_available ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      restaurant_id: restaurantId,
      category_id: categoryId,
      name_en: nameEn.trim(),
      name_hi: nameHi.trim() || null,
      description_en: descEn.trim() || null,
      description_hi: descHi.trim() || null,
      price: parseFloat(price),
      original_price: originalPrice ? parseFloat(originalPrice) : null,
      image_url: imageUrl.trim() || null,
      is_veg: isVeg,
      is_jain: isJain,
      is_spicy: isSpicy,
      is_new: isNew,
      is_featured: isFeatured,
      is_available: isAvailable,
    }

    const { error: err } = item
      ? await supabase.from('menu_items').update(payload).eq('id', item.id)
      : await supabase.from('menu_items').insert(payload)

    if (err) { setError(err.message); setSaving(false) }
    else onSaved()
  }

  const Toggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
      <div
        onClick={() => onChange(!value)}
        style={{
          width: 40, height: 22, borderRadius: 11,
          background: value ? '#ff6b35' : '#2a2a3a',
          position: 'relative', transition: 'background 0.2s', flexShrink: 0,
        }}
      >
        <div style={{
          width: 16, height: 16, borderRadius: '50%', background: 'white',
          position: 'absolute', top: 3, left: value ? 21 : 3, transition: 'left 0.2s',
        }} />
      </div>
      <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{label}</span>
    </label>
  )

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      overflowY: 'auto',
    }}>
      <div className="animate-fade-in" style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 20, padding: 32, width: '100%', maxWidth: 520,
        margin: 'auto',
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 24px' }}>
          {item ? 'Edit Item' : 'Add Menu Item'}
        </h2>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 14, color: '#ef4444' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Name (English) *</label>
              <input value={nameEn} onChange={e => setNameEn(e.target.value)} placeholder="Butter Chicken" required className="input-base" />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Name (Hindi)</label>
              <input value={nameHi} onChange={e => setNameHi(e.target.value)} placeholder="बटर चिकन" className="input-base" style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Description (English)</label>
            <textarea value={descEn} onChange={e => setDescEn(e.target.value)} placeholder="Rich tomato-based curry with tender chicken pieces..." rows={2} className="input-base" style={{ resize: 'none' }} />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Description (Hindi)</label>
            <textarea value={descHi} onChange={e => setDescHi(e.target.value)} placeholder="मलाईदार टमाटर करी में नरम चिकन..." rows={2} className="input-base" style={{ resize: 'none', fontFamily: 'Noto Sans Devanagari, sans-serif' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Price (₹) *</label>
              <input type="number" min="0" step="0.5" value={price} onChange={e => setPrice(e.target.value)} placeholder="320" required className="input-base" />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Original Price (₹) — if on offer</label>
              <input type="number" min="0" step="0.5" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} placeholder="400" className="input-base" />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Photo URL (paste image link)</label>
            <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className="input-base" />
            {imageUrl && (
              <img src={imageUrl} alt="preview" style={{ marginTop: 8, height: 80, borderRadius: 8, objectFit: 'cover' }} />
            )}
          </div>

          {/* Veg/NonVeg toggle */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 12 }}>Type</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setIsVeg(true)}
                style={{
                  flex: 1, padding: '10px', border: `2px solid ${isVeg ? '#22c55e' : '#2a2a3a'}`,
                  borderRadius: 10, background: isVeg ? 'rgba(34,197,94,0.1)' : 'transparent',
                  color: isVeg ? '#22c55e' : 'var(--text-secondary)',
                  cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <div className="veg-dot" style={{ width: 12, height: 12 }} /> Vegetarian
              </button>
              <button
                type="button"
                onClick={() => setIsVeg(false)}
                style={{
                  flex: 1, padding: '10px', border: `2px solid ${!isVeg ? '#ef4444' : '#2a2a3a'}`,
                  borderRadius: 10, background: !isVeg ? 'rgba(239,68,68,0.1)' : 'transparent',
                  color: !isVeg ? '#ef4444' : 'var(--text-secondary)',
                  cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <div className="nonveg-dot" style={{ width: 12, height: 12 }} /> Non-Veg
              </button>
            </div>
          </div>

          {/* Badges */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 12 }}>Badges & Status</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Toggle label="✅ Available" value={isAvailable} onChange={setIsAvailable} />
              <Toggle label="⭐ Best Seller" value={isFeatured} onChange={setIsFeatured} />
              <Toggle label="✨ New Item" value={isNew} onChange={setIsNew} />
              <Toggle label="🌶️ Spicy" value={isSpicy} onChange={setIsSpicy} />
              <Toggle label="🌿 Jain Option" value={isJain} onChange={setIsJain} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 2, opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : item ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
