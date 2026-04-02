'use client'
export default function Extension() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8f7ff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ background: '#3C3489', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ color: 'white', fontSize: 20, fontWeight: 700, textDecoration: 'none' }}>Loopbase</a>
        <a href="/" style={{ color: 'white', fontSize: 13, textDecoration: 'none', background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: 20 }}>Browse patterns</a>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>🧩</div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#3C3489', marginBottom: 12 }}>Loopbase Browser Extension</h1>
        <p style={{ fontSize: 18, color: '#6b7280', lineHeight: 1.7, marginBottom: 32 }}>
          Save any free crochet pattern from anywhere on the web directly to your Loopbase collection. One click, any website.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
          {[
            { icon: '🔍', title: 'Browse anywhere', desc: 'Find a pattern on any blog, YouTube or website' },
            { icon: '🧩', title: 'Click the extension', desc: 'One click saves the title, image and URL automatically' },
            { icon: '💜', title: 'Find it later', desc: 'All your saved patterns in one place on Loopbase' },
          ].map((item, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 16, padding: 20, border: '1.5px solid #ede9fe' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{item.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a', marginBottom: 6 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1.5px solid #ede9fe', marginBottom: 32, textAlign: 'left' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', marginBottom: 16 }}>How to install</h2>
          {[
            'Download the extension files',
            'Open Chrome and go to chrome://extensions',
            'Turn on Developer Mode in the top right corner',
            'Click Load unpacked and select the extension folder',
            'Log in with your Loopbase account and start saving!'
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#3C3489', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
              <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.5, paddingTop: 3 }}>{step}</div>
            </div>
          ))}
        </div>

        <div style={{ background: '#f0ebff', borderRadius: 16, padding: 20, marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: '#6d28d9', fontWeight: 600, marginBottom: 4 }}>Always free</p>
          <p style={{ fontSize: 13, color: '#6b7280' }}>The Loopbase extension is completely free, just like the rest of Loopbase.</p>
        </div>

        <p style={{ fontSize: 13, color: '#9ca3af' }}>
          No account yet?{' '}
          <a href="/login" style={{ color: '#3C3489', fontWeight: 600 }}>Create a free account</a>
        </p>
      </div>
    </div>
  )
}