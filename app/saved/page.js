'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Saved() {
  const [patterns, setPatterns] = useState([])
  const [external, setExternal] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('loopbase')
  const [progressFilter, setProgressFilter] = useState('all')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { window.location.href = '/login'; return }
      setUser(data.user)
      fetchSaved(data.user.id)
      fetchExternal(data.user.id)
    })
  }, [])

  async function fetchSaved(userId) {
    const { data } = await supabase
      .from('saved_patterns')
      .select('*, patterns(*)')
      .eq('user_id', userId)
      .not('pattern_id', 'is', null)
      .order('created_at', { ascending: false })
    setPatterns((data || []).filter(s => s.patterns))
    setLoading(false)
  }

  async function fetchExternal(userId) {
    const { data } = await supabase
      .from('saved_patterns')
      .select('*')
      .eq('user_id', userId)
      .not('pattern_url', 'is', null)
    setExternal(data || [])
  }

  async function unsave(patternId) {
    await supabase.from('saved_patterns').delete().eq('user_id', user.id).eq('pattern_id', patternId)
    setPatterns(patterns.filter(p => p.pattern_id !== patternId))
  }

  async function unsaveExternal(id) {
    await supabase.from('saved_patterns').delete().eq('id', id)
    setExternal(external.filter(p => p.id !== id))
  }

  const levelColor = (d) => {
    if (d === 'Beginner') return { background: '#e8f5e9', color: '#2e7d32' }
    if (d === 'Intermediate') return { background: '#fff8e1', color: '#f57f17' }
    if (d === 'Advanced') return { background: '#fce4ec', color: '#c62828' }
    return {}
  }

  const progressColor = (p) => {
    if (p === 'completed') return { background: '#e8f5e9', color: '#2e7d32', label: 'Completed' }
    if (p === 'in_progress') return { background: '#fff8e1', color: '#f57f17', label: 'In progress' }
    return { background: '#f5f5f5', color: '#999', label: 'Not started' }
  }

  const filteredPatterns = progressFilter === 'all'
    ? patterns
    : patterns.filter(s => (s.progress || 'not_started') === progressFilter)

  const progressCounts = {
    all: patterns.length,
    not_started: patterns.filter(s => !s.progress || s.progress === 'not_started').length,
    in_progress: patterns.filter(s => s.progress === 'in_progress').length,
    completed: patterns.filter(s => s.progress === 'completed').length,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#3C3489', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ color: 'white', fontSize: 20, fontWeight: 700, margin: 0 }}>My saved patterns</h1>
        <a href="/" style={{ color: 'white', fontSize: 13, textDecoration: 'none', background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: 20 }}>Back to browse</a>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          <button onClick={() => setTab('loopbase')} style={{
            padding: '8px 20px', borderRadius: 20, cursor: 'pointer',
            background: tab === 'loopbase' ? '#3C3489' : 'white',
            color: tab === 'loopbase' ? 'white' : '#555',
            fontWeight: 600, fontSize: 13,
            border: tab === 'loopbase' ? 'none' : '1px solid #ddd'
          }}>
            Loopbase patterns ({patterns.length})
          </button>
          <button onClick={() => setTab('extension')} style={{
            padding: '8px 20px', borderRadius: 20, cursor: 'pointer',
            background: tab === 'extension' ? '#3C3489' : 'white',
            color: tab === 'extension' ? 'white' : '#555',
            fontWeight: 600, fontSize: 13,
            border: tab === 'extension' ? 'none' : '1px solid #ddd'
          }}>
            Saved from web ({external.length})
          </button>
        </div>

        {tab === 'loopbase' && (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
              {[
                { value: 'all', label: 'All' },
                { value: 'not_started', label: 'Not started' },
                { value: 'in_progress', label: 'In progress' },
                { value: 'completed', label: 'Completed' },
              ].map(opt => (
                <button key={opt.value} onClick={() => setProgressFilter(opt.value)} style={{
                  padding: '6px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 12,
                  background: progressFilter === opt.value ? '#1a1a1a' : 'white',
                  color: progressFilter === opt.value ? 'white' : '#555',
                  border: progressFilter === opt.value ? 'none' : '1px solid #ddd',
                  fontWeight: progressFilter === opt.value ? 600 : 400
                }}>
                  {opt.label} ({progressCounts[opt.value]})
                </button>
              ))}
            </div>

            {!loading && filteredPatterns.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <p style={{ fontSize: 32, marginBottom: 16 }}>🧶</p>
                <p style={{ color: '#999', fontSize: 16, marginBottom: 16 }}>
                  {progressFilter === 'all' ? 'No saved patterns yet' : 'No ' + progressFilter.replace('_', ' ') + ' patterns'}
                </p>
                {progressFilter === 'all' && (
                  <a href="/" style={{ background: '#3C3489', color: 'white', padding: '10px 24px', borderRadius: 20, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>Browse patterns</a>
                )}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
              {filteredPatterns.map(s => s.patterns && (
                <div key={s.id} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #eee' }}>
                  <div style={{ position: 'relative', height: 180, background: '#f0ede8' }}>
                    {s.patterns.image_url
                      ? <img src={s.patterns.image_url} alt={s.patterns.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>🧶</div>
                    }
                    <span style={{ position: 'absolute', top: 10, right: 10, background: 'white', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, ...levelColor(s.patterns.difficulty) }}>{s.patterns.difficulty}</span>
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a', marginBottom: 2 }}>{s.patterns.title}</div>
                    <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>by {s.patterns.author}</div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 8, fontWeight: 600, ...progressColor(s.progress) }}>
                        {progressColor(s.progress).label}
                      </span>
                      {s.row_count > 0 && (
                        <span style={{ fontSize: 11, color: '#999' }}>Row {s.row_count}</span>
                      )}
                      {s.stitch_count > 0 && (
                        <span style={{ fontSize: 11, color: '#999' }}>{s.stitch_count} stitches</span>
                      )}
                    </div>

                    {s.notes && (
                      <div style={{ fontSize: 12, color: '#666', background: '#faf9f7', padding: '6px 10px', borderRadius: 8, marginBottom: 10, lineHeight: 1.5 }}>
                        {s.notes.length > 80 ? s.notes.substring(0, 80) + '...' : s.notes}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 6 }}>
                      <a href={'/pattern/' + s.patterns.id}
                        style={{ flex: 1, display: 'block', textAlign: 'center', background: '#3C3489', color: 'white', padding: '8px', borderRadius: 10, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                        Track progress
                      </a>
                      <a href={s.patterns.tutorial_url} target="_blank" rel="noopener noreferrer"
                        style={{ flex: 1, display: 'block', textAlign: 'center', background: 'white', color: '#3C3489', padding: '8px', borderRadius: 10, fontSize: 12, fontWeight: 600, textDecoration: 'none', border: '1px solid #3C3489' }}>
                        View pattern
                      </a>
                      <button onClick={() => unsave(s.pattern_id)}
                        style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid #eee', background: 'white', color: '#999', fontSize: 12, cursor: 'pointer' }}>
                        x
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'extension' && (
          <>
            {external.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <p style={{ fontSize: 32, marginBottom: 16 }}>🧩</p>
                <p style={{ color: '#999', fontSize: 16, marginBottom: 8 }}>No patterns saved from the web yet</p>
                <p style={{ color: '#bbb', fontSize: 13 }}>Use the Loopbase browser extension to save patterns from any website</p>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
              {external.map(p => (
                <div key={p.id} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #eee' }}>
                  <div style={{ height: 180, background: '#f0ede8', overflow: 'hidden' }}>
                    {p.pattern_image
                      ? <img src={p.pattern_image} alt={p.pattern_title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>🧶</div>
                    }
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a', marginBottom: 4 }}>{p.pattern_title || 'Saved pattern'}</div>
                    {p.notes && (
                      <div style={{ fontSize: 12, color: '#666', marginBottom: 8, background: '#faf9f7', padding: '6px 10px', borderRadius: 8 }}>
                        {p.notes}
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: '#bbb', marginBottom: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.pattern_url}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <a href={p.pattern_url} target="_blank" rel="noopener noreferrer"
                        style={{ flex: 1, display: 'block', textAlign: 'center', background: '#3C3489', color: 'white', padding: '9px', borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                        View pattern
                      </a>
                      <button onClick={() => unsaveExternal(p.id)}
                        style={{ padding: '9px 12px', borderRadius: 10, border: '1px solid #eee', background: 'white', color: '#999', fontSize: 13, cursor: 'pointer' }}>
                        x
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}