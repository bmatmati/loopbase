'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function detectBrand(url) {
  if (!url) return 'Online retailer'
  const l = url.toLowerCase()
  if (l.includes('amazon.') || l.includes('amzn.to')) return 'Amazon'
  if (l.includes('hobbii.')) return 'Hobbii'
  if (l.includes('etsy.')) return 'Etsy'
  if (l.includes('lovecrafts.')) return 'LoveCrafts'
  if (l.includes('woolwarehouse.')) return 'Wool Warehouse'
  return 'Online retailer'
}

export default function HomeClient({ initialPatterns = [], difficulty: initDifficulty = null, time: initTime = null, format: initFormat = null }) {
  const [patterns, setPatterns] = useState(initialPatterns)
  const [difficulty, setDifficulty] = useState(initDifficulty)
  const [time, setTime] = useState(initTime)
  const [format, setFormat] = useState(initFormat)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [user, setUser] = useState(null)
  const [saved, setSaved] = useState([])
  const [welcome, setWelcome] = useState(false)
  const [showBanner, setShowBanner] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [category, setCategory] = useState(null)
  const [hoveredCard, setHoveredCard] = useState(null)

  useEffect(() => {
    fetchPatterns()
    const params = new URLSearchParams()
    if (difficulty) params.set('difficulty', difficulty)
    if (time) params.set('time', time)
    if (format) params.set('format', format)
    const newUrl = params.toString() ? '?' + params.toString() : '/'
    window.history.replaceState({}, '', newUrl)
  }, [difficulty, time, format])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) fetchSaved(data.user.id)
    })
    const params = new URLSearchParams(window.location.search)
    if (params.get('confirmed') === 'true') {
      setWelcome(true)
      setTimeout(() => setWelcome(false), 5000)
      window.history.replaceState({}, '', '/')
    }
  }, [])

  async function fetchPatterns() {
    let query = supabase.from("patterns").select("*").eq("is_published", true).order("created_at", { ascending: false })
    if (difficulty) query = query.eq('difficulty', difficulty)
    if (time) query = query.eq('time_estimate', time)
    if (format) {
      if (format === 'pattern') query = query.in('format', ['pattern', 'both'])
      else if (format === 'video') query = query.in('format', ['video', 'both'])
      else query = query.eq('format', format)
    }
    const { data } = await query
    setPatterns(data || [])
  }

  async function fetchSaved(userId) {
    const { data } = await supabase.from('saved_patterns').select('pattern_id').eq('user_id', userId)
    setSaved((data || []).map(s => s.pattern_id))
  }

  async function toggleSave(p) {
    if (!user) {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
      return
    }
    if (!user) { window.location.href = '/login'; return }
    const isSaved = saved.includes(p.id)
    if (isSaved) {
      await supabase.from('saved_patterns').delete().eq('user_id', user.id).eq('pattern_id', p.id)
      setSaved(saved.filter(id => id !== p.id))
    } else {
      await supabase.from('saved_patterns').insert([{ user_id: user.id, pattern_id: p.id }])
      setSaved([...saved, p.id])
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
    setSaved([])
  }

  const filtered = patterns.filter(p =>
    (!category || p.category === category) &&
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.author.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.hook_size || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.yarn_weight || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.yarn_type || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.tags || '').toLowerCase().includes(search.toLowerCase())
  )

  const levelColor = (d) => {
    if (d === 'Beginner') return { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' }
    if (d === 'Intermediate') return { bg: '#fef9c3', color: '#854d0e', border: '#fef08a' }
    if (d === 'Advanced') return { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' }
    return { bg: '#f3f4f6', color: '#374151', border: '#e5e7eb' }
  }

    function updateUrl(key, value) {
    const params = new URLSearchParams(window.location.search)
    if (value) params.set(key, value)
    else params.delete(key)
    window.history.replaceState({}, '', '?' + params.toString())
  }

  const chip = (label, active, onClick) => (
    <button onClick={onClick} style={{
      padding: '7px 18px',
      borderRadius: 24,
      border: active ? 'none' : '1.5px solid #e5e7eb',
      background: active ? '#3C3489' : 'white',
      color: active ? 'white' : '#4b5563',
      cursor: 'pointer',
      fontSize: 13,
      fontWeight: active ? 600 : 500,
      whiteSpace: 'nowrap',
      transition: 'all 0.15s ease',
      letterSpacing: '0.01em'
    }}>{label}</button>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7ff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .pattern-card { animation: slideUp 0.3s ease forwards; }
        .pattern-card:hover .card-img { transform: scale(1.04); }
        .quick-btn:hover { background: #2d2566 !important; transform: translateY(-1px); }
        .heart-btn:hover { transform: scale(1.15); }
        @media (max-width: 768px) {
          .grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
          .header-row { flex-direction: column !important; gap: 10px !important; }
          .filter-scroll { padding-bottom: 12px !important; }
        }
        @media (max-width: 480px) {
          .grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ background: 'white', borderBottom: '1px solid #ede9fe', padding: '14px 24px 0', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 1px 12px rgba(60,52,137,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          <div className="header-row" style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <img src="/logo.png" alt="Loopbase" style={{ height: 38, width: 38, borderRadius: 10 }} />
              <span style={{ fontSize: 22, fontWeight: 700, color: '#3C3489', letterSpacing: '-0.5px' }}>Loopbase</span>
            </a>

            <div style={{ flex: 1, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: '#9ca3af' }}>🔍</span>
              <input type="text" placeholder="Search patterns, yarn, hook size..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '10px 16px 10px 40px', borderRadius: 28, border: '1.5px solid #ede9fe', fontSize: 14, outline: 'none', background: '#faf9ff', color: '#1f2937', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = '#a78bfa'}
                onBlur={e => e.target.style.borderColor = '#ede9fe'}
              />
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
              {user ? (
                <>
                  <a href="/saved" style={{ fontSize: 13, color: '#3C3489', fontWeight: 600, textDecoration: 'none', padding: '8px 14px', borderRadius: 20, border: '1.5px solid #ede9fe', background: 'white' }}>My patterns</a>
                  <a href="/tracker" style={{ fontSize: 13, color: 'white', fontWeight: 600, textDecoration: 'none', padding: '8px 14px', borderRadius: 20, background: '#3C3489' }}>Tracker</a>
                  <button onClick={handleLogout} style={{ fontSize: 13, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>Log out</button>
                </>
              ) : (
                <a href="/login" style={{ padding: '9px 20px', borderRadius: 24, background: '#3C3489', color: 'white', fontSize: 13, fontWeight: 600, textDecoration: 'none', letterSpacing: '0.01em' }}>Sign in</a>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <button onClick={() => setShowFilters(f => !f)} style={{ fontSize: 13, color: '#3C3489', background: '#f5f3ff', border: '1px solid #ede9fe', borderRadius: 20, padding: '6px 14px', cursor: 'pointer', fontWeight: 600 }}>
              {showFilters ? 'Hide filters ▲' : 'Filters ▼'}
            </button>
            {(difficulty || time || format || category) && (
              <button onClick={() => { setDifficulty(null); setTime(null); setFormat(null); setCategory(null) }}
                style={{ fontSize: 12, color: '#e11d48', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Clear all
              </button>
            )}
          </div>
          {showFilters && <div className="filter-scroll" style={{ display: 'flex', gap: 8, paddingBottom: 14, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>Level</span>
              {chip('All', !difficulty, () => { setDifficulty(null); updateUrl('difficulty', null) })}
              {chip('Beginner', difficulty === 'Beginner', () => { const v = difficulty === 'Beginner' ? null : 'Beginner'; setDifficulty(v); updateUrl('difficulty', v) })}
              {chip('Intermediate', difficulty === 'Intermediate', () => { const v = difficulty === 'Intermediate' ? null : 'Intermediate'; setDifficulty(v); updateUrl('difficulty', v) })}
              {chip('Advanced', difficulty === 'Advanced', () => { const v = difficulty === 'Advanced' ? null : 'Advanced'; setDifficulty(v); updateUrl('difficulty', v) })}
            </div>
            <div style={{ width: 1, background: '#e5e7eb', margin: '4px 8px' }} />
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>Time</span>
              {chip('Any', !time, () => setTime(null))}
              {chip('Under 2h', time === 'Under 2h', () => setTime(time === 'Under 2h' ? null : 'Under 2h'))}
              {chip('2-5h', time === '2-5h', () => setTime(time === '2-5h' ? null : '2-5h'))}
              {chip('5h+', time === '5h+', () => setTime(time === '5h+' ? null : '5h+'))}
            </div>
            <div style={{ width: 1, background: '#e5e7eb', margin: '4px 8px' }} />
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>Format</span>
              {chip('Any', !format, () => setFormat(null))}
              {chip('Pattern', format === 'pattern', () => setFormat(format === 'pattern' ? null : 'pattern'))}
              {chip('Video', format === 'video', () => setFormat(format === 'video' ? null : 'video'))}
              {chip('Both', format === 'both', () => setFormat(format === 'both' ? null : 'both'))}
            </div>
            <div style={{ width: 1, background: '#e5e7eb', margin: '4px 8px' }} />
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>Category</span>
              {chip('All', !category, () => { setCategory(null); updateUrl('category', null) })}
              {chip('Accessories', category === 'Accessories', () => { const v = category === 'Accessories' ? null : 'Accessories'; setCategory(v); updateUrl('category', v) })}
              {chip('Garments', category === 'Garments', () => { const v = category === 'Garments' ? null : 'Garments'; setCategory(v); updateUrl('category', v) })}
              {chip('Toys', category === 'Toys', () => { const v = category === 'Toys' ? null : 'Toys'; setCategory(v); updateUrl('category', v) })}
              {chip('Home', category === 'Home', () => { const v = category === 'Home' ? null : 'Home'; setCategory(v); updateUrl('category', v) })}
              {chip('Baby', category === 'Baby', () => { const v = category === 'Baby' ? null : 'Baby'; setCategory(v); updateUrl('category', v) })}
              {chip('Other', category === 'Other', () => { const v = category === 'Other' ? null : 'Other'; setCategory(v); updateUrl('category', v) })}
            </div>
          </div>}
        </div>
      </div>

      {welcome && (
        <div style={{ background: '#dcfce7', borderBottom: '1px solid #bbf7d0', padding: '12px 24px', textAlign: 'center', animation: 'fadeIn 0.4s ease' }}>
          <span style={{ fontSize: 14, color: '#166534', fontWeight: 600 }}>Welcome to Loopbase! Your account is confirmed. Start exploring free patterns!</span>
        </div>
      )}

      {showBanner && <div style={{ background: '#f0ebff', borderBottom: '1px solid #e9d5ff', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 16 }}>🧩</span>
          <span style={{ fontSize: 13, color: '#6d28d9' }}>
            <strong>New!</strong> Save any crochet pattern from anywhere with our browser extension
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <a href="/extension" style={{ fontSize: 12, fontWeight: 600, color: '#6d28d9', textDecoration: 'none', background: 'white', padding: '5px 14px', borderRadius: 20, border: '1px solid #c4b5fd', whiteSpace: 'nowrap' }}>Get it free</a>
          <button onClick={() => setShowBanner(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 16, padding: '0 4px' }}>✕</button>
        </div>
      </div>}

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <p style={{ fontSize: 14, color: '#6b7280', fontWeight: 500 }}>
            <span style={{ color: '#3C3489', fontWeight: 700 }}>{filtered.length}</span> free patterns
          </p>
        </div>

        <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {filtered.map((p, i) => {
            const level = levelColor(p.difficulty)
            const isHovered = hoveredCard === p.id
            return (
              <div key={p.id} className="pattern-card"
                style={{ animationDelay: i * 0.04 + 's', background: 'white', borderRadius: 18, overflow: 'hidden', border: '1.5px solid #ede9fe', transition: 'all 0.2s ease', boxShadow: isHovered ? '0 8px 32px rgba(60,52,137,0.12)' : '0 1px 4px rgba(60,52,137,0.06)', transform: isHovered ? 'translateY(-2px)' : 'none', cursor: 'pointer' }}
                onMouseEnter={() => setHoveredCard(p.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => window.location.href = '/pattern/' + p.id}>

                <div style={{ position: 'relative', height: 210, background: '#f5f3ff', overflow: 'hidden' }}>
                  {p.image_url
                    ? <img src={p.image_url} alt={p.title} className="card-img"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
                    />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52 }}>🧶</div>
                  }
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.5) 100%)', pointerEvents: 'none' }} />

                  <span style={{ position: 'absolute', top: 12, left: 12, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: '0.03em', background: level.bg, color: level.color, border: '1px solid ' + level.border }}>
                    {p.difficulty}
                  </span>
                  <button className="heart-btn" onClick={e => { e.stopPropagation(); toggleSave(p) }} style={{ position: 'absolute', top: 10, right: 10, width: 44, height: 44, borderRadius: '50%', border: 'none', background: 'white', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', transition: 'transform 0.15s ease', color: saved.includes(p.id) ? '#e11d48' : '#9ca3af', zIndex: 2 }}>
                    {saved.includes(p.id) ? '♥' : '♡'}
                  </button>
                </div>

                <div style={{ padding: '16px 18px 18px' }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 3, letterSpacing: '-0.2px', lineHeight: 1.3 }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 12, fontWeight: 500 }}>by {p.author}</div>

                  <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
                    {[p.category, p.time_estimate, p.format === 'both' ? 'Video + Pattern' : p.format === 'video' ? 'Video' : 'Pattern'].map((tag, i) => tag && (
                      <span key={i} style={{ background: '#f5f3ff', color: '#6d28d9', padding: '3px 9px', borderRadius: 8, fontSize: 11, fontWeight: 600, border: '1px solid #ede9fe' }}>{tag}</span>
                    ))}
                  </div>


                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🧶</div>
            <p style={{ color: '#6b7280', fontSize: 16, fontWeight: 500 }}>No patterns found — try a different filter</p>
          </div>
        )}
      </div>

      <footer style={{ borderTop: '1px solid #ede9fe', padding: '40px 24px', marginTop: 40, background: 'white' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src="/logo.png" alt="Loopbase" style={{ height: 32, width: 32, borderRadius: 8 }} />
              <span style={{ fontSize: 18, fontWeight: 700, color: '#3C3489' }}>Loopbase</span>
            </div>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {[['About', '/about'], ['Privacy Policy', '/privacy'], ['Affiliate Disclosure', '/affiliate-disclosure'], ['Browser Extension', '/extension'], ['My Patterns', '/saved'], ['Tracker', '/tracker']].map(([label, href]) => (
                <a key={href} href={href} style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>{label}</a>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>© {new Date().getFullYear()} Loopbase. Always free, forever.</span>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>Some links are affiliate links — we earn a small commission at no extra cost to you</span>
          </div>
        </div>
      </footer>

      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,10,40,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 24, maxWidth: 600, width: '100%', maxHeight: '92vh', overflowY: 'auto', position: 'relative', boxShadow: '0 24px 80px rgba(60,52,137,0.25)', animation: 'slideUp 0.25s ease' }}>

            <button onClick={() => setSelected(null)} style={{ position: 'absolute', top: 14, right: 14, width: 34, height: 34, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.08)', cursor: 'pointer', fontSize: 16, zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151', fontWeight: 700 }}>✕</button>

            {selected.image_url && (
              <img src={selected.image_url} alt={selected.title} style={{ width: '100%', height: 260, objectFit: 'cover', borderRadius: '24px 24px 0 0', display: 'block' }} />
            )}

            <div style={{ padding: '24px 28px 28px' }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {[selected.difficulty, selected.time_estimate, selected.category].map((tag, i) => {
                  if (!tag) return null
                  const level = levelColor(selected.difficulty)
                  const style = i === 0 ? { background: level.bg, color: level.color, border: '1px solid ' + level.border } : { background: '#f5f3ff', color: '#6d28d9', border: '1px solid #ede9fe' }
                  return <span key={i} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, ...style }}>{tag}</span>
                })}
              </div>

              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 4, letterSpacing: '-0.5px' }}>{selected.title}</h2>
              <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 14, fontWeight: 500 }}>by {selected.author}</p>

              {selected.description && (
                <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.75, marginBottom: 20, background: '#faf9ff', padding: '12px 16px', borderRadius: 12, border: '1px solid #ede9fe' }}>{selected.description}</p>
              )}

              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                <a href={'/pattern/' + selected.id} style={{ flex: 1, display: 'block', textAlign: 'center', background: '#3C3489', color: 'white', padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: 'none', letterSpacing: '0.02em' }}>
                  Track progress
                </a>

              </div>

              {(selected.yarn_affiliate || selected.hook_affiliate) && (
                <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 20 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Shop supplies</p>
                  <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 14 }}>Affiliate links — small commission at no extra cost to you. Keeps Loopbase free.</p>

                  {selected.yarn_affiliate && (
                    <a href={selected.yarn_affiliate} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 14, border: '1.5px solid #ede9fe', background: '#faf9ff', transition: 'border-color 0.15s' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🧶</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{selected.yarn_name || 'Recommended yarn'}</div>
                          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{detectBrand(selected.yarn_affiliate)}{selected.yarn_price ? ' · ' + selected.yarn_price : ''}</div>
                        </div>
                        <span style={{ background: '#3C3489', color: 'white', padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700 }}>Shop</span>
                      </div>
                    </a>
                  )}

                  {selected.hook_affiliate && (
                    <a href={selected.hook_affiliate} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 14, border: '1.5px solid #ede9fe', background: '#faf9ff' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🪡</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{selected.hook_name || 'Recommended hook'}</div>
                          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{detectBrand(selected.hook_affiliate)}{selected.hook_price ? ' · ' + selected.hook_price : ''}</div>
                        </div>
                        <span style={{ background: '#3C3489', color: 'white', padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700 }}>Shop</span>
                      </div>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}