'use client'
export default function About() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8f7ff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ background: 'white', borderBottom: '1px solid #ede9fe', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 12px rgba(60,52,137,0.06)' }}>
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.svg" alt="Loopbase" style={{ height: 36, width: 36, borderRadius: 8 }} />
          <span style={{ fontSize: 20, fontWeight: 700, color: '#3C3489' }}>Loopbase</span>
        </a>
        <a href="/" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none', padding: '7px 14px', borderRadius: 20, border: '1.5px solid #e5e7eb' }}>Browse patterns</a>
      </div>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#1a1a1a', marginBottom: 8, letterSpacing: '-0.5px' }}>About Loopbase</h1>
        <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 40 }}>The home of free crochet patterns</p>

        <div style={{ fontSize: 16, color: '#374151', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <p>Loopbase was built for crochet lovers who are tired of hunting across dozens of websites to find free patterns. We bring the best free crochet tutorials together in one place, searchable by difficulty, time, format and materials.</p>
          <p>Every pattern on Loopbase is completely free. We will never put patterns behind a paywall. Our promise — always free, forever — is the foundation of everything we do.</p>
          <p>We earn a small commission when you purchase yarn or hooks through our affiliate links, at no extra cost to you. This is how we keep the lights on and the patterns flowing.</p>
          <p>Loopbase also includes a built-in progress tracker so you can log your rows, count your stitches, and keep notes on every pattern you're working on — all in one place.</p>
          <p>We're a small, independent project built with a lot of love for the crochet community. If you have feedback, suggestions, or just want to say hello, we'd love to hear from you.</p>

          <div style={{ background: '#EEEDFE', borderRadius: 16, padding: 24, marginTop: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#3C3489', marginBottom: 8 }}>Get in touch</div>
            <p style={{ fontSize: 14, color: '#534AB7', margin: 0 }}>hello@loopbase.uk</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

function Footer() {
  return (
    <footer style={{ borderTop: '1px solid #ede9fe', padding: '40px 24px', marginTop: 40, background: 'white' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <span style={{ fontSize: 13, color: '#9ca3af' }}>© {new Date().getFullYear()} Loopbase. Always free, forever.</span>
        <div style={{ display: 'flex', gap: 20 }}>
          {[['About', '/about'], ['Privacy Policy', '/privacy'], ['Affiliate Disclosure', '/affiliate-disclosure']].map(([label, href]) => (
            <a key={href} href={href} style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>{label}</a>
          ))}
        </div>
      </div>
    </footer>
  )
}