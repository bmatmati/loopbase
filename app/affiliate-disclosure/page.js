'use client'
export default function AffiliateDisclosure() {
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
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#1a1a1a', marginBottom: 8, letterSpacing: '-0.5px' }}>Affiliate Disclosure</h1>
        <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 40 }}>Last updated: April 2026</p>

        <div style={{ fontSize: 15, color: '#374151', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: 28 }}>
          <p>Loopbase participates in affiliate marketing programmes. This means that when you click on certain links on our site and make a purchase, we may earn a small commission — at absolutely no extra cost to you.</p>

          <div style={{ background: '#EEEDFE', borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#3C3489', marginBottom: 12 }}>Programmes we participate in</div>
            {[
              ['Amazon Associates', 'We earn from qualifying purchases on Amazon.co.uk and Amazon.com'],
              ['Hobbii Affiliate Programme', 'We earn a commission on purchases made through our Hobbii links'],
              ['LoveCrafts Affiliate Programme', 'We earn a commission on purchases made through our LoveCrafts links'],
              ['Wool Warehouse Affiliate Programme', 'We earn a commission on purchases through our Wool Warehouse links'],
            ].map(([name, desc]) => (
              <div key={name} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #ede9fe' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#3C3489', marginBottom: 2 }}>{name}</div>
                <div style={{ fontSize: 13, color: '#534AB7' }}>{desc}</div>
              </div>
            ))}
          </div>

          <p>We only recommend products we genuinely believe are suitable for the patterns they accompany. Our editorial decisions are never influenced by affiliate relationships — we list patterns because they are free and high quality, not because of any commercial arrangement with the creator.</p>
          <p>This disclosure is provided in accordance with the FTC guidelines and ASA regulations in the UK.</p>
          <p>If you have any questions about our affiliate relationships, please contact us at hello@loopbase.uk.</p>
        </div>
      </div>
    </div>
  )
}