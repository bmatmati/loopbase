'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Saved() {
  const [patterns, setPatterns] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = '/login'
        return
      }
      setUser(data.user)
      fetchSaved(data.user.id)
    })
  }, [])

  async function fetchSaved(userId) {
    const { data } = await supabase
      .from('saved_patterns')
      .select('pattern_id, patterns(*)')
      .eq('user_id', userId)
    setPatterns((data || []).map(s => s.patterns))
    setLoading(false)
  }

  async function unsave(patternId) {
    await supabase.from('saved_patterns').delete().eq('user_id', user.id).eq('pattern_id', patternId)
    setPatterns(patterns.filter(p => p.id !== patternId))
  }

  const levelColor = (d) => {
    if (d === 'Beginner') return { background: '#e8f5e9', color: '#2e7d32' }
    if (d === 'Intermediate') return { background: '#fff8e1', color: '#f57f17' }
    if (d === 'Advanced') return { background: '#fce4ec', color: '#c62828' }
    return {}
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#3C3489', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ color: 'white', fontSize: 20, fontWeight: 700, margin: 0 }}>My saved patterns</h1>
        <a href="/" style={{ color: 'white', fontSize: 13, textDecoration: 'none', background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: 20 }}>Back to browse</a>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
        {loading && <p style={{ color: '#999', textAlign: 'center', padding: 40 }}>Loading...</p>}
        {!loading && patterns.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>🧶</p>
            <p style={{ color: '#999', fontSize: 16, marginBottom: 16 }}>No saved patterns yet</p>
            <a href="/" style={{ background: '#3C3489', color: 'white', padding: '10px 24px', borderRadius: 20, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>Browse patterns</a>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {patterns.map(p => p && (
            <div key={p.id} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #eee' }}>
              <div style={{ position: 'relative', height: 200, background: '#f0ede8' }}>
                {p.image_url
                  ? <img src={p.image_url} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>🧶</div>
                }
                <span style={{ position: 'absolute', top: 10, right: 10, background: 'white', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, ...levelColor(p.difficulty) }}>{p.difficulty}</span>
              </div>
              <div style={{ padding: '14px 16px' }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a', marginBottom: 3 }}>{p.title}</div>
                <div style={{ fontSize: 12, color: '#999', marginBottom: 10 }}>by {p.author}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <a href={p.tutorial_url} target="_blank" rel="noopener noreferrer"
                    style={{ flex: 1, display: 'block', textAlign: 'center', background: '#3C3489', color: 'white', padding: '9px', borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                    View pattern
                  </a>
                  <button onClick={() => unsave(p.id)}
                    style={{ padding: '9px 12px', borderRadius: 10, border: '1px solid #eee', background: 'white', color: '#999', fontSize: 13, cursor: 'pointer' }}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}