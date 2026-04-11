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

      <div style={{ background: '#3C3489', padding: '64px 24px', textAlign: 'center' }}>
        <img src="/logo.svg" alt="Loopbase" style={{ height: 72, width: 72, borderRadius: 20, marginBottom: 24, border: '3px solid rgba(255,255,255,0.2)' }} />
        <h1 style={{ fontSize: 40, fontWeight: 800, color: 'white', marginBottom: 16, letterSpacing: '-1px' }}>Built for crochet lovers</h1>
        <p style={{ fontSize: 18, color: '#C4BCE8', maxWidth: 520, margin: '0 auto 32px', lineHeight: 1.7 }}>
          Loopbase brings the best free crochet tutorials together in one place. No paywalls, no subscriptions — always free, forever.
        </p>
        <div style={{ display: 'inline-flex', gap: 12 }}>
          <a href="/" style={{ background: 'white', color: '#3C3489', padding: '12px 24px', borderRadius: 24, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Browse patterns</a>
          <a href="/login" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', padding: '12px 24px', borderRadius: 24, fontWeight: 700, fontSize: 14, textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.3)' }}>Create free account</a>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: -32, marginBottom: 64 }}>
          {[
            { icon: '🧶', value: 'Free', label: 'Always and forever', bg: 'white' },
            { icon: '📖', value: '100+', label: 'Free patterns', bg: 'white' },
            { icon: '🌍', label: 'Community first', icon2: '💜', bg: 'white' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 20, padding: '28px 20px', textAlign: 'center', border: '1.5px solid #ede9fe', boxShadow: '0 4px 20px rgba(60,52,137,0.08)' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{s.icon}</div>
              {s.value && <div style={{ fontSize: 28, fontWeight: 800, color: '#3C3489', marginBottom: 4 }}>{s.value}</div>}
              <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 40 }}>
          {[
            { icon: '🔍', title: 'Find patterns fast', body: 'Search by difficulty, time, format, yarn weight, hook size and more. We surface the right pattern for your skill level and available time.' },
            { icon: '💾', title: 'Save your favourites', body: 'Heart any pattern to save it to your collection. Your saved patterns are always there waiting for you when you are ready to start.' },
            { icon: '📊', title: 'Track your progress', body: 'Log your rows, count your stitches and add notes to every pattern you are working on. Our tracker keeps your projects organised.' },
            { icon: '🧩', title: 'Save from anywhere', body: 'Use our browser extension to save free patterns from any website directly to your Loopbase collection. One click, any site.' },
          ].map((f, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 18, padding: '24px', border: '1.5px solid #ede9fe' }}>
              <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7 }}>{f.body}</div>
            </div>
          ))}
        </div>

        <div style={{ background: '#3C3489', borderRadius: 24, padding: '40px', marginBottom: 40, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#C4BCE8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Our promise</div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: 'white', marginBottom: 16, letterSpacing: '-0.5px', lineHeight: 1.3 }}>Free today, free tomorrow, free always</h2>
            <p style={{ fontSize: 15, color: '#C4BCE8', lineHeight: 1.7, margin: 0 }}>We earn a small commission when you buy yarn or hooks through our affiliate links — at no extra cost to you. That is how we keep Loopbase running without ever charging you a penny.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['No subscription fees', 'No premium tier', 'No ads (yet)', 'No paywalled patterns', 'No data selling'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>✓</div>
                <span style={{ fontSize: 14, color: 'white', fontWeight: 500 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: 20, padding: '32px', border: '1.5px solid #ede9fe', marginBottom: 64, textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 16 }}>👋</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>Say hello</h2>
          <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 20, lineHeight: 1.7 }}>We are a small independent project and we love hearing from the crochet community. Feedback, suggestions, pattern requests — we read everything.</p>
          <a href="mailto:hello@loopbase.uk" style={{ display: 'inline-block', background: '#3C3489', color: 'white', padding: '12px 28px', borderRadius: 24, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>hello@loopbase.uk</a>
        </div>

      </div>

      <footer style={{ borderTop: '1px solid #ede9fe', padding: '32px 24px', background: 'white' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <span style={{ fontSize: 13, color: '#9ca3af' }}>© {new Date().getFullYear()} Loopbase. Always free, forever.</span>
          <div style={{ display: 'flex', gap: 20 }}>
            {[['About', '/about'], ['Privacy Policy', '/privacy'], ['Affiliate Disclosure', '/affiliate-disclosure']].map(([label, href]) => (
              <a key={href} href={href} style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>{label}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}