import Link from 'next/link'

export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      {/* Hero */}
      <section style={{
        maxWidth: 700,
        margin: '0 auto',
        padding: '80px 24px 60px',
        textAlign: 'center',
      }}>
        {/* Logo */}
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, #ff6b35, #f7c948)',
            borderRadius: 16,
            padding: '10px 20px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span style={{ fontSize: 24 }}>🍽️</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>
              MenuQR<span style={{ opacity: 0.8 }}>.in</span>
            </span>
          </div>
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(255,107,53,0.1)',
          border: '1px solid rgba(255,107,53,0.3)',
          borderRadius: 20,
          padding: '4px 14px',
          marginBottom: 24,
          fontSize: 13,
          color: '#ff6b35',
          fontWeight: 600,
        }}>
          🇮🇳 Made for Indian Restaurants
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 60px)',
          fontWeight: 800,
          lineHeight: 1.1,
          marginBottom: 20,
          letterSpacing: '-1.5px',
        }}>
          Stop paying Swiggy{' '}
          <span className="gradient-text">₹15,000/month.</span>
          <br />
          Pay us ₹499 instead.
        </h1>

        <p style={{
          fontSize: 18,
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
          marginBottom: 40,
          maxWidth: 520,
          margin: '0 auto 40px',
        }}>
          Your customers scan a QR code on their table → browse your menu in{' '}
          <strong style={{ color: 'var(--text-primary)' }}>Hindi & English</strong> → order via WhatsApp.
          <br />
          Zero commission. Zero app. Works on day one.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/signup" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ padding: '15px 32px', fontSize: 16 }}>
              Start 14-Day Free Trial →
            </button>
          </Link>
          <Link href="/menu/spice-garden" style={{ textDecoration: 'none' }}>
            <button className="btn-ghost" style={{ padding: '15px 24px', fontSize: 16 }}>
              📱 See Live Demo
            </button>
          </Link>
        </div>

        <p style={{ marginTop: 16, fontSize: 13, color: 'var(--text-muted)' }}>
          No credit card needed · Setup in 20 minutes · Cancel anytime
        </p>
      </section>

      {/* How it works */}
      <section style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: '60px 24px',
      }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, marginBottom: 48 }}>
          How it works
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 24,
        }}>
          {[
            { emoji: '✍️', title: 'Add your menu', desc: 'Enter your dishes, prices, photos in Hindi + English. Takes 20 minutes.' },
            { emoji: '🖨️', title: 'Print QR codes', desc: 'Download QR codes for each table. Print and stick — done.' },
            { emoji: '📱', title: 'Customer scans', desc: 'Customer scans the QR, browses your menu, adds items to cart.' },
            { emoji: '💬', title: 'Order via WhatsApp', desc: 'One tap opens WhatsApp with the full order pre-filled. Order lands in your inbox.' },
          ].map((step, i) => (
            <div key={i} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: '28px 24px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{step.emoji}</div>
              <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 16 }}>{step.title}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Savings calculator */}
      <section style={{
        maxWidth: 600,
        margin: '0 auto',
        padding: '20px 24px 80px',
        textAlign: 'center',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,107,53,0.08), rgba(247,201,72,0.08))',
          border: '1px solid rgba(255,107,53,0.2)',
          borderRadius: 20,
          padding: '40px 32px',
        }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>
            💰 Your savings calculator
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 20,
            marginBottom: 24,
          }}>
            {[
              { label: 'Swiggy/Zomato (25% commission)', amount: '₹12,500/mo', color: '#ef4444' },
              { label: 'MenuQR.in', amount: '₹499/mo', color: '#22c55e' },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'var(--bg-card)',
                borderRadius: 12,
                padding: '20px 16px',
              }}>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{item.label}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: item.color }}>{item.amount}</div>
              </div>
            ))}
          </div>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 12,
            padding: '16px',
            fontSize: 20,
            fontWeight: 700,
          }}>
            You save: <span className="gradient-text">₹12,001/month</span>
          </div>
          <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>
            Based on ₹50,000/month in delivery orders at 25% commission
          </p>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(255,107,53,0.1), rgba(247,201,72,0.05))',
        borderTop: '1px solid var(--border)',
        padding: '60px 24px',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
          Ready to try it free?
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 16 }}>
          14 days free. No credit card. Setup in 20 minutes.
        </p>
        <Link href="/signup">
          <button className="btn-primary" style={{ padding: '16px 40px', fontSize: 17 }}>
            Get Started Free →
          </button>
        </Link>
      </section>
    </main>
  )
}
