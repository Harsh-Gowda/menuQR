'use client'

import Link from 'next/link'
import { ArrowRight, QrCode, Monitor, LineChart, Globe, Smartphone, CheckCircle, ChefHat, CreditCard } from 'lucide-react'

// ── Flowchart step data ────────────────────────────────────────────────────────
const flowSteps = [
  {
    icon: '📍',
    step: '01',
    title: 'Customer Sits Down',
    desc: 'A QR code card is already on every table — no app download, no account needed.',
    color: '#E11D48',
  },
  {
    icon: '📱',
    step: '02',
    title: 'Scans QR Code',
    desc: 'One scan opens a beautiful, photo-rich digital menu directly in their browser.',
    color: '#8b5cf6',
  },
  {
    icon: '🍽️',
    step: '03',
    title: 'Browses & Orders',
    desc: 'Adds items to cart, selects preferences, and confirms — all in under 60 seconds.',
    color: '#f59e0b',
  },
  {
    icon: '✅',
    step: '04',
    title: 'Order Confirmed',
    desc: 'Customer sees a confirmation. The table number is automatically attached.',
    color: '#10b981',
  },
  {
    icon: '👨‍🍳',
    step: '05',
    title: 'Kitchen Screen Rings',
    desc: 'Order instantly appears on your kitchen display. Chef sees it and starts cooking.',
    color: '#3b82f6',
  },
]

export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)', overflow: 'hidden', position: 'relative' }}>

      {/* Decorative Background Elements */}
      <div style={{ position: 'absolute', top: -100, right: -100, width: 600, height: 600, background: 'radial-gradient(circle, rgba(225, 29, 72, 0.15) 0%, rgba(17,17,17,0) 70%)', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '40%', left: -200, width: 500, height: 500, background: 'radial-gradient(circle, rgba(225, 29, 72, 0.08) 0%, rgba(17,17,17,0) 70%)', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '10%', right: -100, width: 700, height: 700, background: 'radial-gradient(circle, rgba(225, 29, 72, 0.05) 0%, rgba(17,17,17,0) 70%)', zIndex: 0 }} />

      {/* ── NAV ── */}
      <nav style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '24px clamp(20px,5vw,80px)',
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--brand-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 900, fontSize: 18,
          }}>🍽️</div>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            MenuQR
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link href="/login" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 14, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Log in
          </Link>
          <Link href="/signup" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'var(--brand-primary)', border: 'none',
              color: 'white', borderRadius: 'var(--radius-pill)',
              padding: '10px 24px', fontSize: 13, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '1px', cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: '0 4px 14px rgba(225, 29, 72, 0.35)',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Get Started
            </button>
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        padding: 'clamp(120px, 15vh, 180px) clamp(20px,5vw,80px) 100px',
        position: 'relative', zIndex: 1,
        maxWidth: 1400, margin: '0 auto',
        display: 'flex', alignItems: 'center', gap: 64, flexWrap: 'wrap',
      }}>

        {/* Left Content */}
        <div className="animate-slide-up" style={{ flex: '1 1 500px', maxWidth: 700 }}>
          <h1 style={{
            fontSize: 'clamp(48px, 6vw, 76px)',
            fontWeight: 800, lineHeight: 1.1,
            letterSpacing: '-0.02em', marginBottom: 24,
            color: 'var(--text-primary)',
          }}>
            Digital menu and <br />
            <span style={{ position: 'relative', display: 'inline-block' }}>
              instant orders
              <svg style={{ position: 'absolute', bottom: -8, left: 0, width: '100%', height: 12 }} preserveAspectRatio="none" viewBox="0 0 200 12" fill="none">
                <path d="M2 10C50 3 150 2 198 8" stroke="var(--brand-primary)" strokeWidth="4" strokeLinecap="round"/>
              </svg>
            </span><br />
            for your restaurant
          </h1>

          <p style={{
            fontSize: 'clamp(16px,2vw,20px)',
            color: 'var(--text-secondary)',
            lineHeight: 1.6, maxWidth: 540,
            margin: '0 0 48px',
            fontWeight: 400,
          }}>
            Zero friction ordering. Customers scan, browse, and place orders directly to your kitchen screen in seconds.
          </p>

          <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ padding: '16px 36px', fontSize: 15, textTransform: 'uppercase', letterSpacing: '1px', boxShadow: '0 8px 24px rgba(225,29,72,0.35)' }}>
                Start Now — ₹499/mo
              </button>
            </Link>
            <Link href="/menu/spice-garden" target="_blank" style={{ textDecoration: 'none' }}>
              <button style={{
                background: 'transparent', border: '1px solid var(--border)',
                color: 'var(--text-primary)', borderRadius: 'var(--radius-pill)',
                padding: '16px 36px', fontSize: 15, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '1px', cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                👁 View Live Demo
              </button>
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginTop: 64 }}>
            <div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Fast Setup</p>
              <p style={{ fontSize: 18, fontWeight: 700 }}>Under 5 min</p>
            </div>
            <div style={{ width: 1, height: 32, background: 'var(--border)' }} />
            <div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>No App Needed</p>
              <p style={{ fontSize: 18, fontWeight: 700 }}>100% Web Based</p>
            </div>
            <div style={{ width: 1, height: 32, background: 'var(--border)' }} />
            <div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Zero Commission</p>
              <p style={{ fontSize: 18, fontWeight: 700 }}>Flat ₹499/mo</p>
            </div>
          </div>
        </div>

        {/* Right Image (Circular) */}
        <div className="animate-scale-in" style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center', position: 'relative', animationDelay: '0.2s' }}>
          <div style={{ position: 'absolute', width: '80%', height: '80%', border: '2px solid var(--brand-primary)', borderRadius: '50%', top: '10%', right: '-5%', opacity: 0.3 }} />
          <div style={{ position: 'absolute', width: '70%', height: '70%', border: '8px solid var(--brand-primary)', borderRadius: '50%', top: '5%', right: 0 }} />

          <img
            src="https://images.unsplash.com/photo-1555126634-323283e090fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            alt="Delicious Food"
            style={{
              width: '100%', maxWidth: 500, aspectRatio: '1/1', objectFit: 'cover',
              borderRadius: '50%', boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
              position: 'relative', zIndex: 2
            }}
          />

          <div style={{
            position: 'absolute', bottom: 40, left: 0, zIndex: 3,
            background: 'var(--bg-card)', padding: '12px 20px', borderRadius: '100px',
            display: 'flex', alignItems: 'center', gap: 12, boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border)'
          }}>
            <span style={{ fontSize: 24 }}>🔥</span>
            <div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hot Service</p>
              <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>4.9/5 Restaurants</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── VISUAL FLOWCHART — How It Works ── */}
      <section style={{ padding: '100px clamp(20px,5vw,80px)', position: 'relative', zIndex: 1, background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <span style={{
              display: 'inline-block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '2px', color: 'var(--brand-primary)', marginBottom: 16,
              background: 'rgba(225,29,72,0.08)', padding: '6px 16px', borderRadius: '100px',
              border: '1px solid rgba(225,29,72,0.2)',
            }}>Live Demo Flow</span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, marginBottom: 16, letterSpacing: '-0.02em' }}>
              See exactly how it works
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 18, maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
              From customer scan to chef notification — the entire process takes under 60 seconds.
            </p>
          </div>

          {/* Flowchart steps */}
          <div style={{ position: 'relative' }}>
            {/* Connecting line (desktop only) */}
            <div className="flowchart-line" style={{ display: 'none', position: 'absolute', top: 48, left: '10%', right: '10%', height: 2, background: 'linear-gradient(90deg, var(--border), var(--brand-primary), var(--border))', zIndex: 0 }} />

            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
              {flowSteps.map((step, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 1 160px', maxWidth: 200 }}>
                  {/* Icon circle */}
                  <div style={{
                    width: 96, height: 96, borderRadius: '50%',
                    background: `${step.color}15`,
                    border: `2px solid ${step.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 40, marginBottom: 20,
                    boxShadow: `0 8px 24px ${step.color}20`,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'default',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = `0 16px 32px ${step.color}30`
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = `0 8px 24px ${step.color}20`
                  }}
                  >
                    {step.icon}
                  </div>

                  {/* Step number */}
                  <div style={{
                    fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
                    letterSpacing: '2px', color: step.color, marginBottom: 8,
                  }}>
                    Step {step.step}
                  </div>

                  <h3 style={{ fontSize: 15, fontWeight: 800, textAlign: 'center', marginBottom: 8, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.5 }}>
                    {step.desc}
                  </p>

                  {/* Arrow connector (except last) */}
                  {i < flowSteps.length - 1 && (
                    <div className="flow-arrow" style={{ display: 'none', position: 'absolute', right: -12, top: 40, color: 'var(--text-muted)', fontSize: 20 }}>→</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CTA below flowchart */}
          <div style={{ textAlign: 'center', marginTop: 72 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20, textTransform: 'uppercase', letterSpacing: '1px' }}>
              See a live restaurant using MenuQR right now
            </p>
            <Link href="/menu/spice-garden" target="_blank" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ padding: '14px 32px', fontSize: 14, textTransform: 'uppercase', letterSpacing: '1px' }}>
                👁 Open Live Demo →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS (3-step cards) ── */}
      <section style={{ padding: '80px clamp(20px,5vw,80px)', maxWidth: 1400, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 800, marginBottom: 16 }}>
            Three roles. One system.
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 18, maxWidth: 600, margin: '0 auto' }}>
            Everything works together seamlessly — for your customers, your kitchen, and you.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40 }}>
          {[
            { step: '01', icon: QrCode, title: 'Customer Scans QR', desc: 'No app download required. The customer simply opens their camera and scans the QR code on their table.' },
            { step: '02', icon: Smartphone, title: 'Browse & Add to Cart', desc: 'They view a beautiful, photo-rich menu in their preferred language and easily select what they want.' },
            { step: '03', icon: ChefHat, title: 'Kitchen Receives Order', desc: 'The order instantly appears on your kitchen display system with the exact table number. Boom. Done.' }
          ].map((item, i) => (
            <div key={i} style={{ position: 'relative', padding: '32px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 64, fontWeight: 900, color: 'var(--bg-base)', position: 'absolute', top: -20, right: 16, opacity: 0.8, WebkitTextStroke: '1px var(--border)' }}>
                {item.step}
              </div>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--brand-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                <item.icon size={24} color="var(--brand-primary)" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>{item.title}</h3>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '100px clamp(20px,5vw,80px)', maxWidth: 1400, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 800, marginBottom: 80, textAlign: 'center' }}>
          Everything you need to <span style={{ color: 'var(--brand-primary)' }}>run smoothly</span>
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
          {[
            { title: 'Beautiful Digital Menu', desc: 'A stunning mobile-first menu that loads instantly, driving more sales through high-quality imagery.', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { title: 'Live Kitchen Screen', desc: 'Orders pop up on the kitchen screen in real-time. Say goodbye to lost paper tickets and confused waiters.', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { title: 'Smart Analytics', desc: 'Track your best-selling dishes, peak hours, and revenue from an elegant dark dashboard.', img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { title: 'Multilingual Support', desc: 'Display your menu in English and Arabic perfectly. Customers read in their preferred language.', img: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' }
          ].map((feature, i) => (
            <div key={i} className="card" style={{ padding: '60px 24px 32px', textAlign: 'center', position: 'relative', overflow: 'visible', background: 'var(--bg-surface)' }}>
              <div style={{
                position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
                width: 80, height: 80, borderRadius: '50%', padding: 4, background: 'var(--bg-surface)',
                boxShadow: '0 10px 20px rgba(0,0,0,0.5)'
              }}>
                <img src={feature.img} alt={feature.title} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>{feature.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ padding: '120px clamp(20px,5vw,80px)', position: 'relative', zIndex: 1, background: 'var(--bg-base)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 64, alignItems: 'center' }}>

          {/* Left: Price & CTA */}
          <div style={{ flex: '1 1 400px' }}>
            <h2 style={{ fontSize: 'clamp(40px, 5vw, 56px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 24, lineHeight: 1.1 }}>
              One flat rate.<br />
              <span style={{ color: 'var(--brand-primary)' }}>Zero commission.</span>
            </h2>
            <p style={{ fontSize: 18, color: 'var(--text-secondary)', marginBottom: 40, lineHeight: 1.6 }}>
              Stop giving away 30% of your revenue to delivery apps. Own your customer experience with our all-in-one digital ordering system.
            </p>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 80, fontWeight: 900, letterSpacing: '-0.05em', color: 'var(--text-primary)', lineHeight: 1 }}>₹499</span>
              <span style={{ fontSize: 20, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>/ month</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
              <CreditCard size={16} color="var(--text-muted)" />
              <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>
                Pay securely via Razorpay · UPI, Cards, Net Banking
              </span>
            </div>

            <Link href="/signup" style={{ textDecoration: 'none', display: 'block' }}>
              <button className="btn-primary" style={{ padding: '18px 40px', fontSize: 16, textTransform: 'uppercase', letterSpacing: '1px', width: '100%', maxWidth: 300, boxShadow: '0 10px 30px rgba(225, 29, 72, 0.3)' }}>
                Get Started — ₹499
              </button>
            </Link>
          </div>

          {/* Right: Feature List */}
          <div style={{ flex: '1 1 400px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '120%', height: '120%', background: 'radial-gradient(circle, rgba(225, 29, 72, 0.15) 0%, rgba(17,17,17,0) 70%)', zIndex: -1 }} />

            <div className="card" style={{ padding: '48px', background: 'var(--bg-surface)', border: '1px solid var(--border)', position: 'relative', zIndex: 1 }}>
              <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 32, textTransform: 'uppercase', letterSpacing: '1px' }}>Everything Included</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {[
                  { title: 'Unlimited Items', desc: 'Add as many dishes and categories as you need.' },
                  { title: 'Live Kitchen Display', desc: 'Orders sent directly to your chef in real-time.' },
                  { title: 'Dual Language', desc: 'Seamlessly switch between English and Arabic.' },
                  { title: 'Smart Analytics', desc: 'Track sales, top dishes, and customer behavior.' },
                  { title: 'Premium Hosting', desc: 'Lightning fast load times for your menu.' },
                ].map((ft, i) => (
                  <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <CheckCircle size={16} strokeWidth={3} />
                    </div>
                    <div>
                      <h4 style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{ft.title}</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>{ft.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: '60px clamp(20px,5vw,80px)',
        background: 'var(--bg-base)',
        borderTop: '1px solid var(--border)',
        textAlign: 'center'
      }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, textTransform: 'uppercase', letterSpacing: '1px' }}>
          © {new Date().getFullYear()} MenuQR. All rights reserved.
        </p>
      </footer>

      <style>{`
        @media (min-width: 960px) {
          .flowchart-line { display: block !important; }
        }
      `}</style>
    </main>
  )
}
