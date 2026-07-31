'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MenuCategory, MenuItem } from '@/types'
import { Plus, Pencil, Trash2, GripVertical, ChevronRight } from 'lucide-react'
import ItemForm from '@/components/dashboard/ItemForm'
import CategoryForm from '@/components/dashboard/CategoryForm'

export default function MenuBuilderPage() {
  const supabase = createClient()
  const [restaurantId, setRestaurantId] = useState('')
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [selectedCat, setSelectedCat] = useState<MenuCategory | null>(null)
  const [showCatForm, setShowCatForm] = useState(false)
  const [editCat, setEditCat] = useState<MenuCategory | null>(null)
  const [showItemForm, setShowItemForm] = useState(false)
  const [editItem, setEditItem] = useState<MenuItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadMenu() }, [])

  async function loadMenu() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: rest } = await supabase.from('restaurants').select('id').eq('owner_user_id', user.id).single()
    if (!rest) return
    setRestaurantId(rest.id)

    const [catRes, itemRes] = await Promise.all([
      supabase.from('menu_categories').select('*').eq('restaurant_id', rest.id).order('sort_order'),
      supabase.from('menu_items').select('*').eq('restaurant_id', rest.id).order('sort_order'),
    ])
    setCategories(catRes.data || [])
    setItems(itemRes.data || [])
    if (catRes.data && catRes.data.length > 0) setSelectedCat(catRes.data[0])
    setLoading(false)
  }

  async function deleteCategory(cat: MenuCategory) {
    if (!confirm(`Delete "${cat.name_en}" and all its items?`)) return
    await supabase.from('menu_categories').delete().eq('id', cat.id)
    loadMenu()
  }

  async function deleteItem(item: MenuItem) {
    if (!confirm(`Delete "${item.name_en}"?`)) return
    await supabase.from('menu_items').delete().eq('id', item.id)
    loadMenu()
  }

  const catItems = items.filter(i => i.category_id === selectedCat?.id)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Menu Builder</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Categories column */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{
            padding: '14px 16px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Categories
            </span>
            <button
              onClick={() => { setEditCat(null); setShowCatForm(true) }}
              style={{
                background: 'rgba(255,107,53,0.1)', border: 'none', borderRadius: 8,
                color: '#ff6b35', fontSize: 13, fontWeight: 600, padding: '5px 10px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <Plus size={14} /> Add
            </button>
          </div>
          <div>
            {loading ? (
              <p style={{ padding: 20, color: 'var(--text-muted)', fontSize: 14 }}>Loading...</p>
            ) : categories.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 12 }}>No categories yet</p>
                <button onClick={() => setShowCatForm(true)} className="btn-primary" style={{ fontSize: 13, padding: '8px 16px' }}>
                  Add first category
                </button>
              </div>
            ) : (
              categories.map(cat => (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCat(cat)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '12px 16px',
                    background: selectedCat?.id === cat.id ? 'rgba(255,107,53,0.06)' : 'transparent',
                    borderLeft: `3px solid ${selectedCat?.id === cat.id ? '#ff6b35' : 'transparent'}`,
                    cursor: 'pointer', transition: 'all 0.12s',
                  }}
                >
                  <GripVertical size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {cat.name_en}
                    </p>
                    {cat.name_hi && <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>{cat.name_hi}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button onClick={e => { e.stopPropagation(); setEditCat(cat); setShowCatForm(true) }}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                      <Pencil size={13} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); deleteCategory(cat) }}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4 }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <ChevronRight size={14} color="var(--text-muted)" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Items column */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{
            padding: '14px 16px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {selectedCat ? `Items in: ${selectedCat.name_en}` : 'Select a category'}
            </span>
            {selectedCat && (
              <button
                onClick={() => { setEditItem(null); setShowItemForm(true) }}
                style={{
                  background: 'rgba(255,107,53,0.1)', border: 'none', borderRadius: 8,
                  color: '#ff6b35', fontSize: 13, fontWeight: 600, padding: '5px 10px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                <Plus size={14} /> Add Item
              </button>
            )}
          </div>

          {!selectedCat ? (
            <p style={{ padding: 32, color: 'var(--text-muted)', fontSize: 14, textAlign: 'center' }}>
              ← Select a category to manage its items
            </p>
          ) : catItems.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 12 }}>No items in this category yet</p>
              <button onClick={() => setShowItemForm(true)} className="btn-primary" style={{ fontSize: 13, padding: '8px 16px' }}>
                + Add first item
              </button>
            </div>
          ) : (
            <div>
              {catItems.map(item => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', borderBottom: '1px solid var(--border)',
                  transition: 'background 0.12s',
                }}>
                  {item.image_url && (
                    <img src={item.image_url} alt={item.name_en}
                      style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div className={item.is_veg ? 'veg-dot' : 'nonveg-dot'} style={{ width: 12, height: 12 }} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{item.name_en}</span>
                      {!item.is_available && <span className="badge badge-red">Unavailable</span>}
                    </div>
                    {item.name_hi && <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>{item.name_hi}</p>}
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', flexShrink: 0 }}>₹{item.price}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => { setEditItem(item); setShowItemForm(true) }}
                      style={{ background: 'rgba(255,107,53,0.08)', border: 'none', borderRadius: 8, color: '#ff6b35', padding: '6px 10px', cursor: 'pointer', fontSize: 13 }}>
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => deleteItem(item)}
                      style={{ background: 'rgba(239,68,68,0.08)', border: 'none', borderRadius: 8, color: '#ef4444', padding: '6px 10px', cursor: 'pointer', fontSize: 13 }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category form modal */}
      {showCatForm && (
        <CategoryForm
          restaurantId={restaurantId}
          category={editCat}
          onClose={() => { setShowCatForm(false); setEditCat(null) }}
          onSaved={() => { setShowCatForm(false); setEditCat(null); loadMenu() }}
        />
      )}

      {/* Item form modal */}
      {showItemForm && selectedCat && (
        <ItemForm
          restaurantId={restaurantId}
          categoryId={selectedCat.id}
          item={editItem}
          onClose={() => { setShowItemForm(false); setEditItem(null) }}
          onSaved={() => { setShowItemForm(false); setEditItem(null); loadMenu() }}
        />
      )}
    </div>
  )
}
