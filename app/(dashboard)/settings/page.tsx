'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Restaurant } from '@/types'
import { ExternalLink } from 'lucide-react'

const AREAS = ['Koramangala', 'Indiranagar', 'BTM Layout', 'HSR Layout', 'Bandra', 'Andheri', 'Connaught Place', 'Lajpat Nagar', 'Anna Nagar', 'T. Nagar', 'Other']
const CUISINES = ['North Indian', 'South Indian', 'Chinese', 'Mughlai', 'Bengali', 'Punjabi', 'Gujarati', 'Street Food', 'Multi-Cuisine', 'Other']
const GST_RATES = [0, 5, 12, 18]

export default function SettingsPage() {
  const supabase = createClient()
  const [restaurant, setRestaurant] = useState<Partial<Restaurant>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [restaurantId, setRestaurantId] = useState('')
  const [testSending, setTestSending] = useState(false)

  useEffect(() => { loadSettings() }, [])

  async function loadSettings() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('restaurants').select('*').eq('owner_user_id', user.id).single()
    if (data) { setRestaurant(data); setRestaurantId(data.id) }
    setLoading(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('restaurants').update({
      name_en: restaurant.name_en,
      name_hi: restaurant.name_hi,
      whatsapp_number: restaurant.whatsapp_number,
      area: restaurant.area,
      cuisine_type: restaurant.cuisine_type,
      gst_percentage: restaurant.gst_percentage,
      gst_type: restaurant.gst_type,
      is_veg_only: restaurant.is_veg_only,
      default_language: restaurant.default_language,
    }).eq('id', restaurantId)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function sendTestOrder() {
    if (!restaurant.whatsapp_number) return
    setTestSending(true)
    const phone = restaurant.whatsapp_number.replace(/\D/g, '')
    const message = encodeURIComponent(
      `🍽️ *TEST ORDER — ${restaurant.name_en}*\n\nThis is a test from MenuQR.in.\nYour WhatsApp ordering is working correctly! ✅`
    )
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
    setTimeout(() => setTestSending(false), 2000)
  }

  if (loading) return <p style={{ color: 'var(--text-muted)' }}>Loading settings...</p>

  const menuUrl = `${process.env.NEXT_PUBLIC_MENU_BASE_URL || 'http://localhost:3000'}/menu/${restaurant.slug}`

  return (
    <div style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 28px' }}>Restaurant Settings</h1>

      {saved && (
        <div style={{
          background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
          borderRadius: 10, padding: '10px 16px', marginBottom: 20, fontSize: 14, color: '#22c55e',
        }}>
          ✅ Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Restaurant identity */}
        <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 18px' }}>Restaurant Profile</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Name (English) *</label>
                <input value={restaurant.name_en || ''} onChange={e => setRestaurant(r => ({ ...r, name_en: e.target.value }))} className="input-base" required />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Name (Hindi)</label>
                <input value={restaurant.name_hi || ''} onChange={e => setRestaurant(r => ({ ...r, name_hi: e.target.value }))} className="input-base" style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }} placeholder="रेस्तराँ का नाम" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Area</label>
                <select value={restaurant.area || ''} onChange={e => setRestaurant(r => ({ ...r, area: e.target.value }))} className="input-base" style={{ cursor: 'pointer' }}>
                  <option value="">Select area...</option>
                  {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Cuisine Type</label>
                <select value={restaurant.cuisine_type || ''} onChange={e => setRestaurant(r => ({ ...r, cuisine_type: e.target.value }))} className="input-base" style={{ cursor: 'pointer' }}>
                  <option value="">Select cuisine...</option>
                  {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <div onClick={() => setRestaurant(r => ({ ...r, is_veg_only: !r.is_veg_only }))} style={{
                  width: 40, height: 22, borderRadius: 11,
                  background: restaurant.is_veg_only ? '#22c55e' : '#2a2a3a',
                  position: 'relative', transition: 'background 0.2s',
                }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: restaurant.is_veg_only ? 21 : 3, transition: 'left 0.2s' }} />
                </div>
                <span style={{ fontSize: 14 }}>🌿 Pure Veg Restaurant</span>
              </label>
            </div>
          </div>
        </section>

        {/* WhatsApp */}
        <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px' }}>WhatsApp Order Number</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px' }}>
            All customer orders will be sent to this number. Must be WhatsApp Business.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', fontSize: 15 }}>
              +91
            </div>
            <input
              value={(restaurant.whatsapp_number || '').replace('+91', '')}
              onChange={e => setRestaurant(r => ({ ...r, whatsapp_number: `+91${e.target.value.replace(/\D/g, '')}` }))}
              placeholder="98765 43210"
              className="input-base"
            />
            <button type="button" onClick={sendTestOrder} className="btn-ghost" style={{ whiteSpace: 'nowrap', fontSize: 13 }}>
              📱 Test
            </button>
          </div>
        </section>

        {/* Menu URL */}
        <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px' }}>Your Menu URL</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <code style={{ flex: 1, background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#ff6b35', wordBreak: 'break-all' }}>
              {menuUrl}
            </code>
            <a href={menuUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
              <button type="button" className="btn-ghost" style={{ padding: '10px 12px' }}>
                <ExternalLink size={16} />
              </button>
            </a>
          </div>
        </section>

        {/* GST & Language */}
        <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>Tax & Language</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>GST Rate</label>
              <select value={restaurant.gst_percentage || 5} onChange={e => setRestaurant(r => ({ ...r, gst_percentage: parseFloat(e.target.value) }))} className="input-base" style={{ cursor: 'pointer' }}>
                {GST_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>GST Type</label>
              <select value={restaurant.gst_type || 'exclusive'} onChange={e => setRestaurant(r => ({ ...r, gst_type: e.target.value as 'inclusive' | 'exclusive' }))} className="input-base" style={{ cursor: 'pointer' }}>
                <option value="exclusive">Add GST at checkout</option>
                <option value="inclusive">Prices include GST</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Default Language</label>
              <select value={restaurant.default_language || 'en'} onChange={e => setRestaurant(r => ({ ...r, default_language: e.target.value as 'en' | 'hi' }))} className="input-base" style={{ cursor: 'pointer' }}>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
          </div>
        </section>

        <button type="submit" disabled={saving} className="btn-primary" style={{ opacity: saving ? 0.7 : 1, padding: '14px' }}>
          {saving ? 'Saving...' : '✓ Save Settings'}
        </button>
      </form>
    </div>
  )
}
