'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MenuCategory } from '@/types'

interface CategoryFormProps {
  restaurantId: string
  category: MenuCategory | null
  onClose: () => void
  onSaved: () => void
}

export default function CategoryForm({ restaurantId, category, onClose, onSaved }: CategoryFormProps) {
  const supabase = createClient()
  const [nameEn, setNameEn] = useState(category?.name_en || '')
  const [nameHi, setNameHi] = useState(category?.name_hi || '')
  const [descEn, setDescEn] = useState(category?.description_en || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      restaurant_id: restaurantId,
      name_en: nameEn.trim(),
      name_hi: nameHi.trim() || null,
      description_en: descEn.trim() || null,
    }

    const { error: err } = category
      ? await supabase.from('menu_categories').update(payload).eq('id', category.id)
      : await supabase.from('menu_categories').insert(payload)

    if (err) { setError(err.message); setSaving(false) }
    else onSaved()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div className="animate-fade-in" style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 20, padding: 32, width: '100%', maxWidth: 440,
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 24px' }}>
          {category ? 'Edit Category' : 'Add Category'}
        </h2>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 14, color: '#ef4444' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Category Name (English) *
            </label>
            <input value={nameEn} onChange={e => setNameEn(e.target.value)} placeholder="e.g. Starters" required className="input-base" />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Category Name (Hindi)
            </label>
            <input
              value={nameHi}
              onChange={e => setNameHi(e.target.value)}
              placeholder="e.g. स्टार्टर"
              className="input-base"
              style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Description (optional)
            </label>
            <input value={descEn} onChange={e => setDescEn(e.target.value)} placeholder="Brief description..." className="input-base" />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1, opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : 'Save Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
