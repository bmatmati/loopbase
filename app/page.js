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

export default function Home() {
  const [patterns, setPatterns] = useState([])
  const [difficulty, setDifficulty] = useState(null)
  const [time, setTime] = useState(null)
  const [format, setFormat] = useState(null)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [user, setUser] = useState(null)
  const [saved, setSaved] = useState([])

  useEffect(() => { fetchPatterns() }, [difficulty, time, format])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) fetchSaved(data.user.id)
    })
  }, [])

  async function fetchPatterns() {
    let query = supabase.from('patterns').select('*').eq('is_published', true)
    if (difficulty) query = query.eq('difficulty', difficulty)
    if (time) query = query.eq('time_estimate', time)
    if (format) {
      if (format === 'pattern') {
        query = query.in('format', ['pattern', 'both'])
      } else if (format === 'video') {
        query = query.in('format', ['video', 'both'])
      } else {
        query = query.eq('format', format)
      }
    }
    const { data } = await query
    setPatterns(data || [])
  }

  async function fetchSaved(userId) {
    const { data } = await supabase
      .from('saved_patterns')
      .select('pattern_id')
      .eq('user_id', userId)
    setSaved((data || []).map(s => s.pattern_id))
  }

  async function toggleSave(p) {
    if (!user) {
      window.location.href = '/login'
      return
    }
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
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.author.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  )

  const chip = (label, active, onClick) => (
    <button onClick={onClick} style={{
      padding: '6px 16px', borderRadius: 20,
      border: active ? '1.5px solid #3C3489' : '1px solid #ddd',
      background: active ? '#3C3489' : 'white',
      color: active ? 'white' : '#555',
      cursor: 'pointer', fontSize: 13,
      fontWeight: active ? 600 : 400, whiteSpace: 'nowrap'
    }}>{label}</button>
  )

  const levelColor = (d) => {
    if (d === 'Beginner') return { background: '#e8f5e9', color: '#2e7d32' }
    if (d === 'Intermediate') return { background: '#fff8e1', color: '#f57f17' }
    if (d === 'Advanced') return { background: '#fce4ec', color: '#c62828' }
    return {}
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: 'white', borderBottom: '1px solid #eee', padding: '20px 24px 0', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: '#3C3489', margin: 0 }}>Loopbase</h1>
              <p style={{ fontSize: 12, color: '#999', margin: 0 }}>Always free, forever</p>
            </div>
            <input type="text" placeholder="Search patterns, creators, categories..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, padding: '10px 16px', borderRadius: 24, border: '1.5px solid #eee', fontSize: 14, outline: 'none', background: '#faf9f7' }} />
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {user ? (
                <>
                  <a href="/saved" style={{ fontSize: 13, color: '#3C3489', fontWeight: 600, textDecoration: 'none' }}>My patterns</a>
                  <button onClick={handleLogout} style={{ fontSize: 13, color: '#999', background: 'none', border: 'none', cursor: 'pointer' }}>Log out</button>
                </>
              ) : (
                <a href="/login" style={{ padding: '8px 16px', borderRadius: 20, background: '#3C3489', color: 'white', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Sign in</a>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, paddingBottom: 16, overflowX: 'auto' }}>
            {chip('All levels', !difficulty, () => setDifficulty(null))}
            {chip('Beginner', difficulty === 'Beginner', () => setDifficulty(difficulty === 'Beginner' ? null : 'Beginner'))}
            {chip('Intermediate', difficulty === 'Intermediate', () => setDifficulty(difficulty === 'Intermediate' ? null : 'Intermediate'))}
            {chip('Advanced', difficulty === 'Advanced', () => setDifficulty(difficulty === 'Advanced' ? null : 'Advanced'))}
            <div style={{ width: 1, background: '#eee', margin: '0 4px' }} />
            {chip('Any time', !time, () => setTime(null))}
            {chip('Under 2h', time === 'Under 2h', () => setTime(time === 'Under 2h' ? null : 'Under 2h'))}
            {chip('2-5h', time === '2-5h', () => setTime(time === '2-5h' ? null : '2-5h'))}
            {chip('5h+', time === '5h+', () => setTime(time === '5h+' ? null : '5h+'))}
            <div style={{ width: 1, background: '#eee', margin: '0 4px' }} />
            {chip('Any format', !format, () => setFormat(null))}
            {chip('Pattern', format === 'pattern', () => setFormat(format === 'pattern' ? null : 'pattern'))}
            {chip('Video', format === 'video', () => setFormat(format === 'video' ? null : 'video'))}
            {chip('Both', format === 'both', () => setFormat(format === 'both' ? null : 'both'))}
          </div>
        </div>
      </div>

      <div style={{ background: '#EEEDFE', borderBottom: '1px solid #d4d0f5', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>🧩</span>
          <div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#3C3489' }}>New! Loopbase browser extension </span>
            <span style={{ fontSize: 13, color: '#666' }}>— save any crochet pattern from anywhere on the web</span>
          </div>
        </div>
        <a href="/extension" style={{ fontSize: 12, fontWeight: 600, color: '#3C3489', textDecoration: 'none', background: 'white', padding: '6px 14px', borderRadius: 20, border: '1px solid #3C3489', whiteSpace: 'nowrap' }}>Get it free</a>
      </div>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px' }}>
        <p style={{ fontSize: 13, color: '#999', marginBottom: 20 }}>{filtered.length} free patterns</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {filtered.map(p => (
            <div key={p.id} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #eee' }}>
              <div style={{ position: 'relative', height: 200, background: '#f0ede8' }}>
                {p.image_url
                  ? <img src={p.image_url} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>yarn</div>
                }
                <span style={{ position: 'absolute', top: 10, right: 10, background: 'white', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, ...levelColor(p.difficulty) }}>{p.difficulty}</span>
                <button onClick={() => toggleSave(p)} style={{ position: 'absolute', top: 10, left: 10, width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'white', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
                 {saved.includes(p.id) ? '♥' : '♡'}
                </button>
              </div>
              <div style={{ padding: '14px 16px' }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a', marginBottom: 3 }}>{p.title}</div>
                <div style={{ fontSize: 12, color: '#999', marginBottom: 10 }}>by {p.author}</div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
                  <span style={{ background: '#f0ede8', color: '#666', padding: '3px 8px', borderRadius: 8, fontSize: 11 }}>{p.category}</span>
                  <span style={{ background: '#f0ede8', color: '#666', padding: '3px 8px', borderRadius: 8, fontSize: 11 }}>{p.time_estimate}</span>
                  <span style={{ background: '#f0ede8', color: '#666', padding: '3px 8px', borderRadius: 8, fontSize: 11 }}>
                    {p.format === 'both' ? 'Video + Pattern' : p.format === 'video' ? 'Video' : 'Pattern'}
                  </span>
                </div>
                <button onClick={() => setSelected(p)} style={{ width: '100%', padding: '9px', borderRadius: 10, background: '#3C3489', color: 'white', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Quick view</button>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ color: '#999', fontSize: 16 }}>No patterns found</p>
          </div>
        )}
      </div>

      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 20, maxWidth: 580, width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setSelected(null)} style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.1)', cursor: 'pointer', fontSize: 14, zIndex: 1 }}>X</button>
            {selected.image_url && (
              <img src={selected.image_url} alt={selected.title} style={{ width: '100%', height: 240, objectFit: 'cover', borderRadius: '20px 20px 0 0', display: 'block' }} />
            )}
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                <span style={{ padding: '3px 10px', borderRadius: 10, fontSize: 12, fontWeight: 600, ...levelColor(selected.difficulty) }}>{selected.difficulty}</span>
                <span style={{ background: '#f0ede8', color: '#666', padding: '3px 10px', borderRadius: 10, fontSize: 12 }}>{selected.time_estimate}</span>
                <span style={{ background: '#f0ede8', color: '#666', padding: '3px 10px', borderRadius: 10, fontSize: 12 }}>{selected.category}</span>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>{selected.title}</h2>
              <p style={{ fontSize: 13, color: '#999', marginBottom: 12 }}>by {selected.author}</p>
              {selected.description && (
                <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, marginBottom: 16 }}>{selected.description}</p>
              )}
              <a href={selected.tutorial_url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center', background: '#3C3489', color: 'white', padding: '12px', borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: 'none', marginBottom: 16 }}>
                View free pattern
              </a>
              {(selected.yarn_affiliate || selected.hook_affiliate) && (
                <div style={{ borderTop: '1px solid #eee', paddingTop: 16 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', marginBottom: 4 }}>Shop supplies</p>
                  <p style={{ fontSize: 11, color: '#aaa', marginBottom: 12 }}>Affiliate links - small commission at no extra cost to you. Keeps Loopbase free.</p>
                  {selected.yarn_affiliate && (
                    <div style={{ borderRadius: 10, border: '1px solid #eee', overflow: 'hidden', marginBottom: 8 }}>
                      <div style={{ background: '#f0ede8', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#333' }}>{selected.yarn_name || 'Recommended yarn'}</div>
                          <div style={{ fontSize: 11, color: '#888' }}>{detectBrand(selected.yarn_affiliate)}{selected.yarn_price ? ' - ' + selected.yarn_price : ''}</div>
                        </div>
                        <a href={selected.yarn_affiliate} target="_blank" rel="noopener noreferrer" style={{ background: '#3C3489', color: 'white', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>Shop yarn</a>
                      </div>
                    </div>
                  )}
                  {selected.hook_affiliate && (
                    <div style={{ borderRadius: 10, border: '1px solid #eee', overflow: 'hidden' }}>
                      <div style={{ background: '#f0ede8', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#333' }}>{selected.hook_name || 'Recommended hook'}</div>
                          <div style={{ fontSize: 11, color: '#888' }}>{detectBrand(selected.hook_affiliate)}{selected.hook_price ? ' - ' + selected.hook_price : ''}</div>
                        </div>
                        <a href={selected.hook_affiliate} target="_blank" rel="noopener noreferrer" style={{ background: '#3C3489', color: 'white', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>Shop hook</a>
                      </div>
                    </div>
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