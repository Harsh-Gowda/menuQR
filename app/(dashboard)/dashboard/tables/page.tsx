'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RestaurantTable } from '@/types'
import { generateQRCode } from '@/lib/qr'
import { Plus, Download, Trash2, QrCode, ExternalLink, Info } from 'lucide-react'

// Use browser origin so QR works on localhost, LAN IP, or production domain
function getMenuURL(slug: string, tableNumber?: string): string {
  const base = typeof window !== 'undefined'
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_MENU_BASE_URL || 'http://localhost:3000')
  return tableNumber
    ? `${base}/menu/${slug}/${tableNumber}`
    : `${base}/menu/${slug}`
}

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
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { loadTables() }, [])

  async function loadTables() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: rest } = await supabase
      .from('restaurants')
      .select('id, slug')
      .eq('owner_user_id', user.id)
      .single()
    if (!rest) return
    setRestaurantId(rest.id)
    setSlug(rest.slug)
    const { data } = await supabase
      .from('restaurant_tables')
      .select('*')
      .eq('restaurant_id', rest.id)
      .order('created_at')
    const tableList = data || []
    setTables(tableList)
    setLoading(false)
    if (tableList.length > 0) generateAllQR(tableList, rest.slug)
  }

  async function generateAllQR(tableList: RestaurantTable[], currentSlug: string) {
    const results: { [id: string]: string } = {}
    for (const t of tableList) {
      results[t.id] = await generateQRCode(getMenuURL(currentSlug, t.table_number))
    }
    setQrMap(results)
  }

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
    setSaving(true)
    setError('')
    const { error: err } = await supabase.from('restaurant_tables').insert({
      restaurant_id: restaurantId,
      table_number: newTableNumber.trim(),
      section: newSection,
    })
    setSaving(false)
    if (err) { setError(err.message); return }
    setNewTableNumber('')
    setAdding(false)
    loadTables()
  }

  async function deleteTable(id: string) {
    if (!confirm('Delete this table and its QR code?')) return
    await supabase.from('restaurant_tables').delete().eq('id', id)
    setTables(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px' }}>Tables & QR Codes</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>
            Each table gets a unique QR code. Customer scans it → sees your menu → orders via WhatsApp.
          </p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', fontSize: 14 }}
        >
          <Plus size={16} /> Add Table
        </button>
      </div>

      {/* How it works */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,107,53,0.08), rgba(247,201,72,0.04))',
        border: '1px solid rgba(255,107,53,0.2)',
        borderRadius: 14, padding: '14px 18px', marginBottom: 24,
        display: 'flex', gap: 12, alignItems: 'flex-start',
      }}>
        <Info size={17} color="#ff6b35" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          <strong style={{ color: 'var(--text-primary)' }}>How it works:</strong>
          {' '}Print the QR → place on table → customer scans with phone →
          menu opens → they add items → tap <strong style={{ color: '#25d366' }}>"Order via WhatsApp"</strong>
          {' '}→ WhatsApp opens with the full order pre-filled → they send to you.
          <br />
          <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
            ⚠️ For testing on phone: make sure phone is on the <strong>same Wi-Fi</strong> as this computer.
            The QR embeds your current browser URL ({typeof window !== 'undefined' ? window.location.origin : ''}).
          </span>
        </div>
      </div>

      {/* Menu preview bar */}
      {slug && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '12px 16px', marginBottom: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <QrCode size={17} color="#ff6b35" />
            <div>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>Your menu URL</p>
              <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                {getMenuURL(slug)}
              </p>
            </div>
          </div>
          <a href={getMenuURL(slug)} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
            <button className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '8px 14px' }}>
              <ExternalLink size={13} /> Preview Menu
            </button>
          </a>
        </div>
      )}

      {/* Tables grid */}
      {loading ? (
        <div style={{ color: 'var(--text-muted)', padding: 24 }}>Loading tables...</div>
      ) : tables.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)', border: '2px dashed var(--border)',
          borderRadius: 16, padding: 56, textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📱</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>No tables yet</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
            Add tables to generate unique QR codes. Print them and place on each table.
          </p>
          <button onClick={() => setAdding(true)} className="btn-primary" style={{ padding: '11px 24px' }}>
            + Add First Table
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {tables.map(table => {
            const menuUrl = getMenuURL(slug, table.table_number)
            return (
              <div key={table.id} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 16, padding: 20, textAlign: 'center',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
              }}>
                {/* Label */}
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {table.section || 'Table'}
                </span>
                <h3 style={{ fontSize: 22, fontWeight: 800, margin: '4px 0 14px', color: 'var(--text-primary)' }}>
                  Table {table.table_number}
                </h3>

                {/* QR Image */}
                {qrMap[table.id] ? (
                  <div style={{ background: 'white', borderRadius: 12, padding: 8, marginBottom: 10, boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
                    <img
                      src={qrMap[table.id]}
                      alt={`QR Table ${table.table_number}`}
                      style={{ width: 164, height: 164, display: 'block' }}
                    />
                  </div>
                ) : (
                  <div style={{
                    width: 180, height: 180, background: 'var(--bg-base)', borderRadius: 12,
                    marginBottom: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}>
                    <QrCode size={36} color="var(--text-muted)" />
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Generating...</span>
                  </div>
                )}

                {/* URL */}
                <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '0 0 12px', fontFamily: 'monospace', wordBreak: 'break-all', lineHeight: 1.5, textAlign: 'center' }}>
                  {menuUrl}
                </p>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, width: '100%' }}>
                  <a href={menuUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', flex: 1 }}>
                    <button style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                      padding: '8px 10px',
                      background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.25)',
                      borderRadius: 8, color: '#ff6b35', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}>
                      <ExternalLink size={12} /> Test
                    </button>
                  </a>
                  <button
                    onClick={() => downloadQR(table.id, table.table_number)}
                    disabled={!qrMap[table.id]}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                      padding: '8px 10px',
                      background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)',
                      borderRadius: 8, color: '#60a5fa', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      opacity: !qrMap[table.id] ? 0.5 : 1,
                    }}
                  >
                    <Download size={12} /> Download
                  </button>
                  <button
                    onClick={() => deleteTable(table.id)}
                    style={{
                      padding: '8px 10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                      borderRadius: 8, color: '#ef4444', cursor: 'pointer', flexShrink: 0,
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add table modal */}
      {adding && (
        <div
          onClick={e => { if (e.target === e.currentTarget) { setAdding(false); setError('') } }}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          }}
        >
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 20, padding: 32, width: '100%', maxWidth: 400,
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 20px' }}>Add New Table</h2>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#ef4444',
              }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={addTable} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Table Number / Name *
                </label>
                <input
                  value={newTableNumber}
                  onChange={e => setNewTableNumber(e.target.value)}
                  placeholder="e.g. 1, 2, A3, Terrace-1, VIP"
                  required
                  className="input-base"
                  autoFocus
                />
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>
                  This label appears in the QR URL and on the customer's order WhatsApp message.
                </p>
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
                  {['Indoor', 'Outdoor', 'Rooftop', 'AC Section', 'Non-AC', 'Private Room', 'Terrace', 'Bar', 'Garden'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Live URL preview */}
              {newTableNumber.trim() && slug && (
                <div style={{ background: 'var(--bg-base)', borderRadius: 10, padding: '10px 14px' }}>
                  <p style={{ margin: '0 0 4px', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    QR will link to:
                  </p>
                  <p style={{ margin: 0, fontSize: 12, fontFamily: 'monospace', color: '#ff6b35', wordBreak: 'break-all' }}>
                    {getMenuURL(slug, newTableNumber.trim())}
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => { setAdding(false); setError(''); setNewTableNumber('') }}
                  className="btn-ghost"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                  style={{ flex: 1, opacity: saving ? 0.7 : 1 }}
                >
                  {saving ? 'Adding...' : '+ Add Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
