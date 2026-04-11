'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Tracker() {
  const [user, setUser] = useState(null)
  const [patterns, setPatterns] = useState([])
  const [loading, setLoading] = useState(true)
  const [fullscreen, setFullscreen] = useState(null)
  const [stitchInput, setStitchInput] = useState(0)
  const [filter, setFilter] = useState('in_progress')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { window.location.href = '/login'; return }
      setUser(data.user)
      fetchPatterns(data.user.id)
    })
  }, [])

  async function fetchPatterns(userId) {
    const { data } = await supabase
      .from('saved_patterns')
      .select('*, patterns(*)')
      .eq('user_id', userId)
      .not('pattern_id', 'is', null)
      .order('created_at', { ascending: false })
    setPatterns((data || []).filter(s => s.patterns))
    setLoading(false)
  }

  async function updateStatus(id, progress) {
    await supabase.from('saved_patterns').update({ progress }).eq('id', id)
    setPatterns(patterns.map(p => p.id === id ? { ...p, progress } : p))
  }

  async function completeRow(s) {
    const newLog = JSON.parse(s.row_log || '[]')
    newLog.push({ row: s.row_count, stitches: stitchInput })
    const newTotal = (s.stitch_count || 0) + stitchInput
    const newRow = (s.row_count || 1) + 1
    await supabase.from('saved_patterns').update({
      row_count: newRow,
      stitch_count: newTotal,
      row_log: JSON.stringify(newLog),
      progress: 'in_progress'
    }).eq('id', s.id)
    setPatterns(patterns.map(p => p.id === s.id ? {
      ...p, row_count: newRow, stitch_count: newTotal, row_log: JSON.stringify(newLog), progress: 'in_progress'
    } : p))
    setFullscreen({ ...s, row_count: newRow, stitch_count: newTotal })
    setStitchInput(0)
  }

  const filtered = filter === 'all' ? patterns : patterns.filter(p => (p.progress || 'not_started') === filter)

  const stats = {
    in_progress: patterns.filter(p => p.progress === 'in_progress').length,
    completed: patterns.filter(p => p.progress === 'completed').length,
    total_stitches: patterns.reduce((acc, p) => acc + (p.stitch_count || 0), 0),
  }

  const progressColor = (p) => {
    if (p === 'completed') return { bg: '#e8f5e9', color: '#2e7d32', label: 'Completed' }
    if (p === 'in_progress') return { bg: '#fff8e1', color: '#f57f17', label: 'In progress' }
    return { bg: '#f5f5f5', color: '#9e9e9e', label: 'Not started' }
  }

  const barWidth = (s) => {
    const log = JSON.parse(s.row_log || '[]')
    if (!log.length) return 0
    return Math.min(100, (log.length / 20) * 100)
  }

  if (fullscreen) {
    const s = fullscreen
    return (
      <div style={{ minHeight: '100vh', background: '#3C3489', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, sans-serif', padding: 24 }}>
        <button onClick={() => setFullscreen(null)} style={{ position: 'absolute', top: 20, left: 20, background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 13 }}>← Back</button>

        <div style={{ textAlign: 'center', width: '100%', maxWidth: 320 }}>
          {s.patterns?.image_url && (
            <img src={s.patterns.image_url} alt={s.patterns.title} style={{ width: 80, height: 80, borderRadius: 16, objectFit: 'cover', marginBottom: 16, border: '3px solid rgba(255,255,255,0.3)' }} />
          )}
          <div style={{ fontSize: 13, color: '#C4BCE8', marginBottom: 4 }}>{s.patterns?.title}</div>
          <div style={{ fontSize: 13, color: '#C4BCE8', marginBottom: 32 }}>Row {s.row_count || 1}</div>

          <div style={{ fontSize: 88, fontWeight: 700, color: 'white', lineHeight: 1, marginBottom: 8 }}>{stitchInput}</div>
          <div style={{ fontSize: 13, color: '#C4BCE8', marginBottom: 32 }}>stitches this row</div>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 28 }}>
            <button onClick={() => setStitchInput(Math.max(0, stitchInput - 1))}
              style={{ width: 64, height: 64, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', background: 'transparent', color: 'white', fontSize: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
            <button onClick={() => setStitchInput(stitchInput + 1)}
              style={{ width: 64, height: 64, borderRadius: '50%', border: 'none', background: 'white', color: '#3C3489', fontSize: 32, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
          </div>

          <button onClick={() => completeRow(s)}
            style={{ width: '100%', padding: '14px', borderRadius: 14, border: '2px solid rgba(255,255,255,0.3)', background: 'transparent', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 16 }}>
            Complete row {s.row_count || 1} →
          </button>

          <div style={{ fontSize: 12, color: '#C4BCE8' }}>
            {s.stitch_count || 0} total stitches · {JSON.parse(s.row_log || '[]').length} rows logged
          </div>

          <div style={{ marginTop: 24, background: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: 16, width: '100%' }}>
            <div style={{ fontSize: 12, color: '#C4BCE8', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Row history</div>
            {JSON.parse(s.row_log || '[]').length === 0 ? (
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '8px 0' }}>No rows completed yet</div>
            ) : (
              <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {JSON.parse(s.row_log || '[]').map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.08)' }}>
                    <span style={{ fontSize: 13, color: '#C4BCE8', fontWeight: 600 }}>Row {r.row}</span>
                    <span style={{ fontSize: 13, color: 'white', fontWeight: 700 }}>{r.stitches} stitches</span>
                  </div>
                )).reverse()}
              </div>
            )}
          </div>

          <div style={{ marginTop: 16, background: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: 16, width: '100%' }}>
            <div style={{ fontSize: 12, color: '#C4BCE8', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>My notes</div>
            <div style={{ fontSize: 13, color: 'white', lineHeight: 1.6, textAlign: 'left' }}>
              {s.notes || 'No notes yet — add them on the pattern page'}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7ff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ background: 'white', borderBottom: '1px solid #ede9fe', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 12px rgba(60,52,137,0.06)' }}>
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.svg" alt="Loopbase" style={{ height: 36, width: 36, borderRadius: 8 }} />
          <span style={{ fontSize: 20, fontWeight: 700, color: '#3C3489' }}>Loopbase</span>
        </a>
        <div style={{ display: 'flex', gap: 10 }}>
          <a href="/saved" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none', padding: '7px 14px', borderRadius: 20, border: '1.5px solid #e5e7eb' }}>My patterns</a>
          <a href="/" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none', padding: '7px 14px', borderRadius: 20, border: '1.5px solid #e5e7eb' }}>Browse</a>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>

        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1a1a', marginBottom: 6, letterSpacing: '-0.5px' }}>My tracker</h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 28 }}>Track your rows, stitches and progress across all your patterns</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
          {[
            { label: 'In progress', value: stats.in_progress, bg: '#EEEDFE', color: '#3C3489' },
            { label: 'Completed', value: stats.completed, bg: '#e8f5e9', color: '#2e7d32' },
            { label: 'Total stitches', value: stats.total_stitches.toLocaleString(), bg: '#f5f5f5', color: '#374151' },
          ].map((s, i) => (
            <div key={i} style={{ background: s.bg, borderRadius: 16, padding: '16px 20px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: s.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            { value: 'in_progress', label: 'In progress' },
            { value: 'not_started', label: 'Not started' },
            { value: 'completed', label: 'Completed' },
            { value: 'all', label: 'All patterns' },
          ].map(opt => (
            <button key={opt.value} onClick={() => setFilter(opt.value)} style={{
              padding: '7px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 13,
              background: filter === opt.value ? '#3C3489' : 'white',
              color: filter === opt.value ? 'white' : '#555',
              border: filter === opt.value ? 'none' : '1.5px solid #e5e7eb',
              fontWeight: filter === opt.value ? 600 : 400
            }}>{opt.label}</button>
          ))}
        </div>

        {loading && <p style={{ color: '#9ca3af', textAlign: 'center', padding: 40 }}>Loading...</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(s => {
            const pc = progressColor(s.progress)
            const log = JSON.parse(s.row_log || '[]')
            return (
              <div key={s.id} style={{ background: 'white', borderRadius: 18, border: '1.5px solid #ede9fe', padding: 18, display: 'flex', gap: 16, alignItems: 'center', boxShadow: '0 1px 4px rgba(60,52,137,0.06)' }}>
                <div style={{ width: 70, height: 70, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: '#f5f3ff' }}>
                  {s.patterns?.image_url
                    ? <img src={s.patterns.image_url} alt={s.patterns.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🧶</div>
                  }
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 2 }}>{s.patterns?.title}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>Row {s.row_count || 1} · {(s.stitch_count || 0).toLocaleString()} stitches · {log.length} rows logged</div>
                  <div style={{ height: 6, borderRadius: 3, background: '#f0ede8', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: barWidth(s) + '%', background: '#7F77DD', borderRadius: 3, transition: 'width 0.3s ease' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => { setFullscreen(s); setStitchInput(0) }}
                    style={{ background: '#3C3489', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    Track →
                  </button>
                  <select value={s.progress || 'not_started'} onChange={e => updateStatus(s.id, e.target.value)}
                    style={{ fontSize: 11, padding: '5px 8px', borderRadius: 8, border: '1.5px solid #ede9fe', background: pc.bg, color: pc.color, fontWeight: 600, cursor: 'pointer', outline: 'none' }}>
                    <option value="not_started">Not started</option>
                    <option value="in_progress">In progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🧶</div>
            <p style={{ color: '#9ca3af', fontSize: 16, marginBottom: 16 }}>No patterns here yet</p>
            <a href="/" style={{ background: '#3C3489', color: 'white', padding: '10px 24px', borderRadius: 20, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>Browse patterns</a>
          </div>
        )}
      </div>
    </div>
  )
}