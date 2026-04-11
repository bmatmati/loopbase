'use client'
export default function Privacy() {
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
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#1a1a1a', marginBottom: 8, letterSpacing: '-0.5px' }}>Privacy Policy</h1>
        <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 40 }}>Last updated: April 2026</p>

        <div style={{ fontSize: 15, color: '#374151', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: 28 }}>
          {[
            { title: 'What we collect', body: 'When you create an account, we collect your email address and a hashed password. When you save patterns or track progress, we store that data linked to your account. We do not collect your name, address, or payment information.' },
            { title: 'How we use your data', body: 'Your data is used solely to provide the Loopbase service — saving patterns, tracking progress, and keeping your account secure. We do not sell your data to third parties and never will.' },
            { title: 'Cookies', body: 'We use essential cookies to keep you logged in. We do not use advertising cookies or third-party tracking cookies.' },
            { title: 'Affiliate links', body: 'Some links on Loopbase are affiliate links to products on Amazon, Hobbii, and other retailers. Clicking these links may set cookies on those third-party sites. We earn a small commission on qualifying purchases at no extra cost to you.' },
            { title: 'Data storage', body: 'Your data is stored securely using Supabase, hosted in the EU. We take reasonable technical measures to protect your data from unauthorised access.' },
            { title: 'Your rights', body: 'You can delete your account at any time by contacting us at hello@loopbase.uk. We will permanently delete all your data within 30 days of your request.' },
            { title: 'Contact', body: 'For any privacy questions, please contact us at hello@loopbase.uk.' },
          ].map(({ title, body }) => (
            <div key={title}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', marginBottom: 10 }}>{title}</h2>
              <p style={{ margin: 0 }}>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}