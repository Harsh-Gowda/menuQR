import Link from 'next/link'

const features = [
  { icon: '📱', title: 'Scan & Order', desc: 'Customer scans QR → browses menu → places order directly. No app download, no login.' },
  { icon: '🍳', title: 'Live Kitchen Display', desc: 'Orders appear instantly on your kitchen screen. Chef sees table number, items, and notes in real-time.' },
  { icon: '📊', title: 'Smart Dashboard', desc: 'Track orders, views, and revenue from one beautiful dashboard. Know your busiest hours.' },
  { icon: '🌐', title: 'Multilingual Menu', desc: 'Display menu in English + Arabic. Customers see it in their language automatically.' },
  { icon: '🔒', title: 'Zero Phone Numbers', desc: 'No WhatsApp, no phone sharing. Customers order privately, securely, anonymously.' },
  { icon: '⚡', title: 'Setup in 20 Min', desc: 'Add your menu, download QR codes, stick on tables. Live in one afternoon.' },
]

const steps = [
  { n: '01', title: 'Add your menu', desc: 'Upload dishes, prices, photos. Available in English and Arabic.' },
  { n: '02', title: 'Print QR codes', desc: 'One unique QR per table. Download, print, stick — done.' },
  { n: '03', title: 'Customer scans & orders', desc: 'They see your menu, tap items, hit Place Order. That\'s it.' },
  { n: '04', title: 'Kitchen gets notified', desc: 'Order appears live on your kitchen screen with table number instantly.' },
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
        padding: '0 clamp(20px,5vw,80px)',
        height: 64,
        background: 'rgba(8,8,16,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg,#ff6b35,#f7c948)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>🍽️</div>
          <span style={{ fontSize: 17, fontWeight: 800, color: '#f0f0ff', letterSpacing: '-0.4px' }}>
            Menu<span style={{ color: '#ff6b35' }}>QR</span>
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/login" style={{ textDecoration: 'none' }}>
            <button className="btn-ghost" style={{ padding: '8px 18px', fontSize: 14 }}>Sign In</button>
          </Link>
          <Link href="/signup" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ padding: '8px 20px', fontSize: 14 }}>Get Started Free</button>
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        position: 'relative',
        padding: 'clamp(80px,12vh,140px) clamp(20px,5vw,80px) 100px',
        textAlign: 'center',
        overflow: 'hidden',
      }}>
        {/* Background glow orbs */}
        <div className="glow-orb" style={{ width: 600, height: 600, background: 'rgba(255,107,53,0.12)', top: -200, left: '50%', transform: 'translateX(-50%)' }} />
        <div className="glow-orb" style={{ width: 400, height: 400, background: 'rgba(99,102,241,0.08)', top: 100, right: -100 }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto' }}>
          {/* Pill badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.2)',
            borderRadius: 100, padding: '6px 16px', marginBottom: 32,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff6b35', animation: 'pulse 2s infinite', display: 'inline-block' }} />
            <span style={{ fontSize: 13, color: '#ff8a5b', fontWeight: 600 }}>
              Direct ordering — no phone number, no WhatsApp
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(40px,6.5vw,76px)',
            fontWeight: 900,
            lineHeight: 1.06,
            letterSpacing: '-2.5px',
            marginBottom: 24,
            color: '#f0f0ff',
          }}>
            Your menu.{' '}
            <span className="gradient-text">Their table.</span>
            <br />
            Zero friction.
          </h1>

          <p style={{
            fontSize: 'clamp(17px,2.2vw,21px)',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            maxWidth: 560,
            margin: '0 auto 48px',
          }}>
            Customers scan a QR code, browse your menu, and place orders{' '}
            <strong style={{ color: '#f0f0ff' }}>directly to the kitchen</strong>. No app. No phone number. No middleman.
          </p>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" style={{ textDecoration: 'none' }}>
              <button id="hero-cta-signup" className="btn-primary" style={{ padding: '16px 36px', fontSize: 16, animation: 'glow-pulse 3s infinite' }}>
                Start Free — 14 Days ✦
              </button>
            </Link>
            <Link href="/menu/spice-garden" target="_blank" style={{ textDecoration: 'none' }}>
              <button id="hero-cta-demo" className="btn-ghost" style={{ padding: '16px 28px', fontSize: 16 }}>
                📱 See Live Demo
              </button>
            </Link>
          </div>

          <p style={{ marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
            No credit card · Setup in 20 minutes · Cancel anytime
          </p>

          {/* Social proof avatars */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 40 }}>
            <div style={{ display: 'flex' }}>
              {['🧑‍🍳','👩','🧑','👨‍💼','👩‍🍳'].map((e, i) => (
                <div key={i} style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: `hsl(${i * 60 + 20},60%,25%)`,
                  border: '2px solid var(--bg-base)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, marginLeft: i > 0 ? -10 : 0,
                }}>{e}</div>
              ))}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              <strong style={{ color: '#f0f0ff' }}>500+ restaurants</strong> trust MenuQR
            </p>
          </div>
        </div>
      </section>

      {/* ── PROBLEM → SOLUTION ── */}
      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,80px)', position: 'relative' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 2,
            background: 'var(--border)', borderRadius: 24, overflow: 'hidden',
          }}>
            {/* Before */}
            <div style={{ background: 'var(--bg-card)', padding: 40 }}>
              <div style={{
                display: 'inline-block', fontSize: 11, fontWeight: 800, letterSpacing: '0.1em',
                color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 6, padding: '3px 10px', marginBottom: 20,
              }}>BEFORE</div>
              <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, color: '#f0f0ff' }}>The old painful way</h3>
              {['Staff runs to every table to take orders', 'Orders get mixed up or forgotten', 'Restaurant WhatsApp number exposed to all customers', 'Kitchen gets verbal orders — errors everywhere', 'No data, no analytics, just chaos'].map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'flex-start' }}>
                  <span style={{ color: '#ef4444', fontSize: 16, flexShrink: 0, marginTop: 2 }}>✕</span>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.5 }}>{t}</p>
                </div>
              ))}
            </div>
            {/* After */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,107,53,0.06) 0%, rgba(8,8,16,1) 60%)',
              padding: 40, position: 'relative',
            }}>
              <div style={{
                display: 'inline-block', fontSize: 11, fontWeight: 800, letterSpacing: '0.1em',
                color: '#4ade80', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                borderRadius: 6, padding: '3px 10px', marginBottom: 20,
              }}>WITH MENUQR</div>
              <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, color: '#f0f0ff' }}>Smooth, modern, fast</h3>
              {['Customer scans QR, orders from their phone', 'Order appears on kitchen screen in 1 second', 'Zero phone number or WhatsApp required', 'Chef gets every detail perfectly — table, items, notes', 'Live dashboard with views, orders, and revenue'].map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'flex-start' }}>
                  <span style={{ color: '#4ade80', fontSize: 16, flexShrink: 0, marginTop: 2 }}>✓</span>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.5 }}>{t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,80px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ color: '#ff6b35', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', marginBottom: 12 }}>HOW IT WORKS</p>
            <h2 style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 900, letterSpacing: '-1.5px', color: '#f0f0ff' }}>
              From setup to first order<br />in under an hour
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20 }}>
            {steps.map((s, i) => (
              <div key={i} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 20, padding: 28, position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: 20, right: 20,
                  fontSize: 48, fontWeight: 900, color: 'rgba(255,107,53,0.06)',
                  letterSpacing: '-2px', lineHeight: 1,
                }}>{s.n}</div>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'linear-gradient(135deg,rgba(255,107,53,0.15),rgba(247,201,72,0.08))',
                  border: '1px solid rgba(255,107,53,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, marginBottom: 18,
                }}>
                  {['✍️','🖨️','📱','🍳'][i]}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: '#f0f0ff' }}>{s.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{
        padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,80px)',
        background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99,102,241,0.06) 0%, transparent 70%)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ color: '#818cf8', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', marginBottom: 12 }}>EVERYTHING YOU NEED</p>
            <h2 style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 900, letterSpacing: '-1.5px', color: '#f0f0ff' }}>
              Built for restaurants<br />that mean business
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>
            {features.map((f, i) => (
              <div key={i} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 20, padding: '28px 28px',
                transition: 'all 0.2s', cursor: 'default',
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(99,102,241,0.3)'
                  ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'
                  ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: '#f0f0ff' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,80px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ color: '#ff6b35', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', marginBottom: 12 }}>LOVED BY RESTAURATEURS</p>
            <h2 style={{ fontSize: 'clamp(28px,3.5vw,44px)', fontWeight: 900, letterSpacing: '-1px', color: '#f0f0ff' }}>
              Real results, real restaurants
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 20, padding: 28,
              }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                  {'★★★★★'.split('').map((s, j) => (
                    <span key={j} style={{ color: '#f7c948', fontSize: 16 }}>{s}</span>
                  ))}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <div>
                  <p style={{ fontWeight: 700, color: '#f0f0ff', fontSize: 14 }}>{t.name}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t.rest}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,80px)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#ff6b35', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', marginBottom: 12 }}>PRICING</p>
          <h2 style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 900, letterSpacing: '-1.5px', color: '#f0f0ff', marginBottom: 16 }}>
            Flat rate. No surprises.
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 18, marginBottom: 48 }}>
            Swiggy takes 25% of every order. We take ₹0 commission.
          </p>

          <div style={{
            background: 'linear-gradient(135deg, rgba(255,107,53,0.08) 0%, rgba(247,201,72,0.05) 100%)',
            border: '1px solid rgba(255,107,53,0.25)',
            borderRadius: 28, padding: '48px 40px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div className="glow-orb" style={{ width: 300, height: 300, background: 'rgba(255,107,53,0.1)', top: -100, left: -100 }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 20, color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹999</span>
                <span className="gradient-text" style={{ fontSize: 72, fontWeight: 900, letterSpacing: '-3px', lineHeight: 1 }}>₹499</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: 18 }}>/month</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 36 }}>Limited launch pricing · Lock in forever</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 36, textAlign: 'left' }}>
                {['Unlimited menu items', 'Unlimited orders', 'Real-time kitchen display', 'QR codes for all tables', 'Analytics dashboard', 'Multilingual menu (EN + AR)', 'Direct ordering (no WhatsApp)', 'Priority support'].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: '#4ade80', fontSize: 16 }}>✓</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{f}</span>
                  </div>
                ))}
              </div>

              <Link href="/signup" style={{ textDecoration: 'none', display: 'block' }}>
                <button id="pricing-cta" className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: 17 }}>
                  Start 14-Day Free Trial →
                </button>
              </Link>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 14 }}>
                No credit card required · Cancel anytime
              </p>
            </div>
          </div>

          {/* Savings comparison */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
            <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 16, padding: '20px 16px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 8 }}>Swiggy at 25% commission</p>
              <p style={{ color: '#f87171', fontSize: 26, fontWeight: 900 }}>₹12,500<span style={{ fontSize: 14, fontWeight: 500 }}>/mo</span></p>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>on ₹50k/month orders</p>
            </div>
            <div style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 16, padding: '20px 16px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 8 }}>MenuQR flat fee</p>
              <p style={{ color: '#4ade80', fontSize: 26, fontWeight: 900 }}>₹499<span style={{ fontSize: 14, fontWeight: 500 }}>/mo</span></p>
              <p style={{ color: '#4ade80', fontSize: 12, marginTop: 4, fontWeight: 600 }}>Save ₹12,001 every month</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{
        padding: 'clamp(80px,10vw,120px) clamp(20px,5vw,80px)',
        textAlign: 'center',
        position: 'relative',
        background: 'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(255,107,53,0.1) 0%, transparent 70%)',
      }}>
        <h2 style={{ fontSize: 'clamp(36px,5vw,64px)', fontWeight: 900, letterSpacing: '-2px', color: '#f0f0ff', marginBottom: 20 }}>
          Ready to modernize<br />your restaurant?
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 18, marginBottom: 40 }}>
          Join 500+ restaurants already using MenuQR.
        </p>
        <Link href="/signup" style={{ textDecoration: 'none' }}>
          <button id="final-cta" className="btn-primary" style={{ padding: '18px 48px', fontSize: 18 }}>
            Get Started Free — No Card Needed →
          </button>
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '24px clamp(20px,5vw,80px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>🍽️</span>
          <span style={{ fontWeight: 800, color: '#f0f0ff', fontSize: 14 }}>MenuQR</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>© 2026 MenuQR. All rights reserved.</p>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Privacy', 'Terms', 'Contact'].map(l => (
            <span key={l} style={{ color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>{l}</span>
          ))}
        </div>
      </footer>

      <style>{`
        @keyframes glow-pulse {
          0%,100% { box-shadow: 0 0 20px rgba(255,107,53,0.25); }
          50%      { box-shadow: 0 0 40px rgba(255,107,53,0.55), 0 0 80px rgba(255,107,53,0.2); }
        }
      `}</style>
    </main>
  )
}
