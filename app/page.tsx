'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle2, Shield, Smartphone, Monitor, Globe, Clock, BarChart3 } from 'lucide-react'

const features = [
  { icon: Smartphone, title: 'Scan & Order', desc: 'Customer scans QR → browses menu → places order directly. No app download, no login.' },
  { icon: Monitor, title: 'Live Kitchen Display', desc: 'Orders appear instantly on your kitchen screen. Chef sees table number, items, and notes in real-time.' },
  { icon: BarChart3, title: 'Smart Dashboard', desc: 'Track orders, views, and revenue from one beautiful dashboard. Know your busiest hours.' },
  { icon: Globe, title: 'Multilingual Menu', desc: 'Display menu in English + Arabic. Customers see it in their language automatically.' },
  { icon: Shield, title: 'Zero Phone Numbers', desc: 'No WhatsApp, no phone sharing. Customers order privately, securely, anonymously.' },
  { icon: Clock, title: 'Setup in 20 Min', desc: 'Add your menu, download QR codes, stick on tables. Live in one afternoon.' },
]

const steps = [
  { n: '1', title: 'Add your menu', desc: 'Upload dishes, prices, photos. Available in English and Arabic.' },
  { n: '2', title: 'Print QR codes', desc: 'One unique QR per table. Download, print, stick — done.' },
  { n: '3', title: 'Customer scans', desc: 'They see your menu, tap items, and hit Place Order. That\'s it.' },
  { n: '4', title: 'Kitchen gets notified', desc: 'Order appears live on your kitchen screen instantly.' },
]

const testimonials = [
  { name: 'Raj Malhotra', rest: 'Spice Garden, Mumbai', text: 'Before MenuQR our staff was spending 15 minutes per table just taking orders. Now it\'s instant. 40% more tables per night.', stars: 5 },
  { name: 'Fatima Al-Rashid', rest: 'Zaytoon Café, Dubai', text: 'The kitchen display is a game changer. Chef sees exactly what\'s needed. No more miscommunication, no re-orders.', stars: 5 },
  { name: 'Priya Sharma', rest: 'Dosa Corner, Bangalore', text: 'Setup was shockingly easy. 20 minutes and we were live. My customers love how smooth it is.', stars: 5 },
]

export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)', overflow: 'hidden' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(20px,5vw,80px)', height: 72,
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--brand-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: 18,
          }}>M</div>
          <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            MenuQR
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/login" style={{ textDecoration: 'none' }}>
            <button className="btn-ghost">Log in</button>
          </Link>
          <Link href="/signup" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ padding: '10px 20px', borderRadius: 100 }}>
              Get Started <ArrowRight size={16} />
            </button>
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        padding: 'clamp(80px,12vh,140px) clamp(20px,5vw,80px) 100px',
        textAlign: 'center', position: 'relative',
        background: 'linear-gradient(to bottom, #f9fafb, #ffffff)',
      }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 880, margin: '0 auto' }}>
          
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--brand-primary-light)', color: 'var(--brand-primary)',
            borderRadius: 100, padding: '6px 16px', marginBottom: 32,
            fontSize: 13, fontWeight: 600, border: '1px solid rgba(37,99,235,0.2)'
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-primary)', animation: 'pulse 2s infinite', display: 'inline-block' }} />
            New: Direct kitchen ordering
          </div>

          <h1 style={{
            fontSize: 'clamp(44px,7vw,72px)',
            fontWeight: 800, lineHeight: 1.05,
            letterSpacing: '-2px', marginBottom: 24,
            color: 'var(--text-primary)',
          }}>
            Your menu. Their table.<br />
            <span style={{ color: 'var(--brand-primary)' }}>Zero friction.</span>
          </h1>

          <p style={{
            fontSize: 'clamp(18px,2vw,22px)',
            color: 'var(--text-secondary)',
            lineHeight: 1.6, maxWidth: 640,
            margin: '0 auto 48px',
          }}>
            Customers scan a QR code, browse your menu, and place orders directly to the kitchen. No app download. No middleman.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ padding: '16px 36px', fontSize: 16, borderRadius: 100 }}>
                Start Free Trial
              </button>
            </Link>
            <Link href="/menu/spice-garden" target="_blank" style={{ textDecoration: 'none' }}>
              <button className="btn-secondary" style={{ padding: '16px 28px', fontSize: 16, borderRadius: 100 }}>
                View Live Demo
              </button>
            </Link>
          </div>

          <p style={{ marginTop: 24, fontSize: 14, color: 'var(--text-muted)' }}>
            No credit card required · Setup in 20 minutes
          </p>
        </div>
      </section>

      {/* ── PROBLEM → SOLUTION ── */}
      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,80px)', background: '#ffffff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px' }}>Built to streamline your workflow</h2>
            <p style={{ fontSize: 18, color: 'var(--text-secondary)', marginTop: 12 }}>Everything you need, nothing you don't. We handle the admin.</p>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px,1fr))', gap: 32,
          }}>
            <div className="card" style={{ padding: 40, borderTop: '4px solid #ef4444' }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>The old painful way</h3>
              {['Staff runs to every table to take orders', 'Orders get mixed up or forgotten', 'Kitchen gets verbal orders — errors everywhere', 'No data, no analytics, just chaos'].map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'flex-start' }}>
                  <span style={{ color: '#ef4444', flexShrink: 0, marginTop: 2 }}>✕</span>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.5, margin: 0 }}>{t}</p>
                </div>
              ))}
            </div>
            
            <div className="card" style={{ padding: 40, borderTop: '4px solid var(--brand-primary)', boxShadow: 'var(--shadow-md)' }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>With MenuQR</h3>
              {['Customer scans QR, orders from their phone', 'Order appears on kitchen screen in 1 second', 'Chef gets every detail perfectly — table, items, notes', 'Live dashboard with views, orders, and revenue'].map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'flex-start' }}>
                  <CheckCircle2 color="var(--brand-primary)" size={20} style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: 15, lineHeight: 1.5, margin: 0 }}>{t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,80px)', background: 'var(--bg-surface)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ color: 'var(--brand-primary)', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Features</p>
            <h2 style={{ fontSize: 'clamp(32px,4vw,44px)', fontWeight: 800, letterSpacing: '-1px', marginTop: 12 }}>Everything you need to run smoothly</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {features.map((f, i) => (
              <div key={i} className="card" style={{ padding: 32 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: 'var(--brand-primary-light)', color: 'var(--brand-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20
                }}>
                  <f.icon size={24} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,80px)', background: '#ffffff' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ color: 'var(--brand-primary)', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Pricing</p>
            <h2 style={{ fontSize: 'clamp(32px,4vw,44px)', fontWeight: 800, letterSpacing: '-1px', marginTop: 12 }}>Clear pricing that grows with you</h2>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="card" style={{ maxWidth: 480, width: '100%', padding: 48, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: 'var(--brand-primary)' }} />
              <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Pro Plan</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Everything you need for your restaurant.</p>
              
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 4, marginBottom: 40 }}>
                <span style={{ fontSize: 56, fontWeight: 800, letterSpacing: '-2px' }}>₹499</span>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>/month</span>
              </div>

              <div style={{ textAlign: 'left', marginBottom: 40 }}>
                {[
                  'Unlimited digital menu items',
                  'Unlimited QR code scans',
                  'Direct kitchen ordering system',
                  'Real-time analytics dashboard',
                  'Zero commission on orders',
                ].map((ft, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
                    <CheckCircle2 color="var(--brand-primary)" size={18} />
                    <span style={{ color: 'var(--text-primary)', fontSize: 15 }}>{ft}</span>
                  </div>
                ))}
              </div>

              <Link href="/signup" style={{ textDecoration: 'none', display: 'block' }}>
                <button className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: 16, borderRadius: 100 }}>
                  Start 14-Day Free Trial
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: '60px clamp(20px,5vw,80px)',
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border)',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 24 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--text-primary)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16,
          }}>M</div>
          <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            MenuQR
          </span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          © {new Date().getFullYear()} MenuQR. All rights reserved.
        </p>
      </footer>

      <style>{`
        @keyframes pulse {
          0%,100%{opacity:1;transform:scale(1)}
          50%{opacity:0.6;transform:scale(0.85)}
        }
      `}</style>
    </main>
  )
}
