'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RestaurantTable } from '@/types'
import { generateQRCode, getMenuURL } from '@/lib/qr'
import { Plus, Download, Trash2, QrCode } from 'lucide-react'

export default function TablesPage() {
  const supabase = createClient()
  const [restaurantId, setRestaurantId] = useState('')
  const [slug, setSlug] = useState('')
  const [tables, setTables] = useState<RestaurantTable[]>([])
  const [loading, setLoading] = useState(true)
  const [qrMap, setQrMap] = useState<{ [tableId: string]: string }>({})
  const [adding, setAdding] = useState(false)
  const [newTableNumber, setNewTableNumber] = useState('')
  const [newSection, setNewSection] = useState('Indoor')

  useEffect(() => { loadTables() }, [])

  async function loadTables() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: rest } = await supabase.from('restaurants').select('id, slug').eq('owner_user_id', user.id).single()
    if (!rest) return
    setRestaurantId(rest.id)
    setSlug(rest.slug)
    const { data } = await supabase.from('restaurant_tables').select('*').eq('restaurant_id', rest.id).order('created_at')
    setTables(data || [])
    setLoading(false)
  }

  async function generateQRForTable(table: RestaurantTable) {
    if (qrMap[table.id]) return qrMap[table.id]
    const url = getMenuURL(slug, table.table_number)
    const qr = await generateQRCode(url)
    setQrMap(prev => ({ ...prev, [table.id]: qr }))
    return qr
  }

  async function loadAllQR() {
    const results: typeof qrMap = {}
    for (const t of tables) {
      const url = getMenuURL(slug, t.table_number)
      results[t.id] = await generateQRCode(url)
    }
    setQrMap(results)
  }

  useEffect(() => {
    if (tables.length > 0 && slug) loadAllQR()
  }, [tables, slug])

  function downloadQR(tableId: string, tableNumber: string) {
    const qr = qrMap[tableId]
    if (!qr) return
    const a = document.createElement('a')
    a.href = qr
    a.download = `table-${tableNumber}-qr.png`
    a.click()
  }

  async function addTable(e: React.FormEvent) {
    e.preventDefault()
    await supabase.from('restaurant_tables').insert({
      restaurant_id: restaurantId,
      table_number: newTableNumber.trim(),
      section: newSection,
    })
    setNewTableNumber('')
    setAdding(false)
    loadTables()
  }

  async function deleteTable(id: string) {
    if (!confirm('Delete this table?')) return
    await supabase.from('restaurant_tables').delete().eq('id', id)
    loadTables()
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px' }}>Tables & QR Codes</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>
            Each table gets a unique QR code linking to your menu.
          </p>
        </div>
        <button onClick={() => setAdding(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', fontSize: 14 }}>
          <Plus size={16} /> Add Table
        </button>
      </div>

      {/* Menu URL info */}
      {slug && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '14px 18px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <QrCode size={20} color="#ff6b35" />
          <div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>Table QR URL format:</p>
            <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
              {getMenuURL(slug, 'TABLE-NUMBER')}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading tables...</p>
      ) : tables.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)', border: '2px dashed var(--border)',
          borderRadius: 16, padding: 48, textAlign: 'center',
        }}>
          <QrCode size={40} color="var(--text-muted)" style={{ marginBottom: 16 }} />
          <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>No tables added yet</p>
          <button onClick={() => setAdding(true)} className="btn-primary" style={{ fontSize: 14, padding: '10px 20px' }}>
            + Add your first table
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {tables.map(table => (
            <div key={table.id} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 16, padding: 20, textAlign: 'center',
            }}>
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {table.section || 'Table'}
                </span>
                <h3 style={{ fontSize: 22, fontWeight: 800, margin: '4px 0', color: 'var(--text-primary)' }}>
                  Table {table.table_number}
                </h3>
              </div>

              {/* QR code */}
              {qrMap[table.id] ? (
                <div style={{
                  background: 'white', borderRadius: 12, padding: 8, display: 'inline-block', marginBottom: 14,
                }}>
                  <img src={qrMap[table.id]} alt={`QR for Table ${table.table_number}`} style={{ width: 140, height: 140, display: 'block' }} />
                </div>
              ) : (
                <div style={{
                  width: 156, height: 156, background: 'var(--bg-base)', borderRadius: 12,
                  margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <QrCode size={40} color="var(--text-muted)" />
                </div>
              )}

              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 14px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {getMenuURL(slug, table.table_number)}
              </p>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => downloadQR(table.id, table.table_number)}
                  disabled={!qrMap[table.id]}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '8px 12px', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)',
                    borderRadius: 8, color: '#60a5fa', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    opacity: !qrMap[table.id] ? 0.5 : 1,
                  }}
                >
                  <Download size={14} /> PNG
                </button>
                <button
                  onClick={() => deleteTable(table.id)}
                  style={{
                    padding: '8px 10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
                    borderRadius: 8, color: '#ef4444', cursor: 'pointer',
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add table modal */}
      {adding && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }}>
          <div className="animate-fade-in" style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 20, padding: 32, width: '100%', maxWidth: 380,
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 20px' }}>Add Table</h2>
            <form onSubmit={addTable} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Table Number *
                </label>
                <input
                  value={newTableNumber}
                  onChange={e => setNewTableNumber(e.target.value)}
                  placeholder="e.g. 1, 2, A, Terrace-1"
                  required
                  className="input-base"
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Section
                </label>
                <select
                  value={newSection}
                  onChange={e => setNewSection(e.target.value)}
                  className="input-base"
                  style={{ cursor: 'pointer' }}
                >
                  {['Indoor', 'Outdoor', 'Rooftop', 'AC Section', 'Non-AC', 'Private Room', 'Terrace'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setAdding(false)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Add Table</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
