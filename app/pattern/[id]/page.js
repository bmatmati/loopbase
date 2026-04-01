'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

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

export default function PatternDetail() {
  const { id } = useParams()
  const [pattern, setPattern] = useState(null)
  const [user, setUser] = useState(null)
  const [tracker, setTracker] = useState(null)
  const [notes, setNotes] = useState('')
  const [rowCount, setRowCount] = useState(0)
  const [stitchCount, setStitchCount] = useState(0)
  const [progress, setProgress] = useState('not_started')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchPattern()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user)
        fetchTracker(data.user.id)
      }
    })
  }, [id])

  async function fetchPattern() {
    const { data } = await supabase.from('patterns').select('*').eq('id', id).single()
    setPattern(data)
  }

  async function fetchTracker(userId) {
    const { data } = await supabase
      .from('saved_patterns')
      .select('*')
      .eq('user_id', userId)
      .eq('pattern_id', id)
      .single()
    if (data) {
      setTracker(data)
      setNotes(data.notes || '')
      setRowCount(data.row_count || 0)
      setStitchCount(data.stitch_count || 0)
      setProgress(data.progress || 'not_started')
      setSaved(true)
    }
  }

  async function saveTracker() {
    if (!user) { window.location.href = '/login'; return }
    setSaving(true)
    const payload = { user_id: user.id, pattern_id: id, notes, row_count: rowCount, stitch_count: stitchCount, progress }
    if (tracker) {
      await supabase.from('saved_patterns').update(payload).eq('id', tracker.id)
    } else {
      const { data } = await supabase.from('saved_patterns').insert([payload]).select().single()
      setTracker(data)
    }
    setSaved(true)
    setSaving(false)
    setMessage('Saved!')
    setTimeout(() => setMessage(''), 2000)
  }

  const levelColor = (d) => {
    if (d === 'Beginner') return { background: '#e8f5e9', color: '#2e7d32' }
    if (d === 'Intermediate') return { background: '#fff8e1', color: '#f57f17' }
    if (d === 'Advanced') return { background: '#fce4ec', color: '#c62828' }
    return {}
  }

  const progressOptions = [
    { value: 'not_started', label: 'Not started', color: '#999', bg: '#f5f5f5' },
    { value: 'in_progress', label: 'In progress', color: '#f57f17', bg: '#fff8e1' },
    { value: 'completed', label: 'Completed', color: '#2e7d32', bg: '#e8f5e9' },
  ]

  if (!pattern) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui' }}>
      <p style={{ color: '#999' }}>Loading...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#3C3489', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ color: 'white', fontSize: 18, fontWeight: 700, textDecoration: 'none' }}>Loopbase</a>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {user && <a href="/saved" style={{ color: 'white', fontSize: 13, textDecoration: 'none' }}>My patterns</a>}
          <a href="/" style={{ color: 'white', fontSize: 13, textDecoration: 'none', background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: 20 }}>Back to browse</a>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>

        <div>
          {pattern.image_url && (
            <img src={pattern.image_url} alt={pattern.title}
              style={{ width: '100%', height: 340, objectFit: 'cover', borderRadius: 16, marginBottom: 20, display: 'block' }} />
          )}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600, ...levelColor(pattern.difficulty) }}>{pattern.difficulty}</span>
            <span style={{ background: '#f0ede8', color: '#666', padding: '4px 12px', borderRadius: 20, fontSize: 13 }}>{pattern.time_estimate}</span>
            <span style={{ background: '#f0ede8', color: '#666', padding: '4px 12px', borderRadius: 20, fontSize: 13 }}>{pattern.category}</span>
            <span style={{ background: '#f0ede8', color: '#666', padding: '4px 12px', borderRadius: 20, fontSize: 13 }}>
              {pattern.format === 'both' ? 'Video + Pattern' : pattern.format === 'video' ? 'Video' : 'Pattern'}
            </span>
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>{pattern.title}</h1>
          <p style={{ fontSize: 14, color: '#999', marginBottom: 16 }}>by {pattern.author}</p>

          {pattern.description && (
            <p style={{ fontSize: 15, color: '#555', lineHeight: 1.8, marginBottom: 20 }}>{pattern.description}</p>
          )}

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
            {[
              pattern.hook_size && ['Hook size', pattern.hook_size],
              pattern.yarn_weight && ['Yarn weight', pattern.yarn_weight],
              pattern.yarn_type && ['Yarn type', pattern.yarn_type],
              pattern.tags && ['Tags', pattern.tags],
            ].filter(Boolean).map(([label, value]) => (
              <tr key={label} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px 0', fontSize: 14, color: '#999', width: 140 }}>{label}</td>
                <td style={{ padding: '10px 0', fontSize: 14, color: '#333', fontWeight: 500 }}>{value}</td>
              </tr>
            ))}
          </table>

          <a href={pattern.tutorial_url} target="_blank" rel="noopener noreferrer"
            style={{ display: 'block', textAlign: 'center', background: '#3C3489', color: 'white', padding: '14px', borderRadius: 12, fontSize: 16, fontWeight: 700, textDecoration: 'none', marginBottom: 24 }}>
            View free pattern
          </a>

          {(pattern.yarn_affiliate || pattern.hook_affiliate) && (
            <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #eee' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: '#1a1a1a' }}>Shop supplies</h3>
              <p style={{ fontSize: 12, color: '#aaa', marginBottom: 14 }}>Affiliate links — small commission at no extra cost to you</p>
              {pattern.yarn_affiliate && (
                <a href={pattern.yarn_affiliate} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, border: '1px solid #eee', background: '#faf9f7' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{pattern.yarn_name || 'Recommended yarn'}</div>
                      <div style={{ fontSize: 12, color: '#999' }}>{detectBrand(pattern.yarn_affiliate)}{pattern.yarn_price ? ' · ' + pattern.yarn_price : ''}</div>
                    </div>
                    <span style={{ background: '#3C3489', color: 'white', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>Shop yarn</span>
                  </div>
                </a>
              )}
              {pattern.hook_affiliate && (
                <a href={pattern.hook_affiliate} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, border: '1px solid #eee', background: '#faf9f7' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{pattern.hook_name || 'Recommended hook'}</div>
                      <div style={{ fontSize: 12, color: '#999' }}>{detectBrand(pattern.hook_affiliate)}{pattern.hook_price ? ' · ' + pattern.hook_price : ''}</div>
                    </div>
                    <span style={{ background: '#3C3489', color: 'white', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>Shop hook</span>
                  </div>
                </a>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #eee' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: '#1a1a1a' }}>Progress</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {progressOptions.map(opt => (
                <button key={opt.value} onClick={() => setProgress(opt.value)} style={{
                  padding: '10px 14px', borderRadius: 10, border: progress === opt.value ? 'none' : '1px solid #eee',
                  background: progress === opt.value ? opt.bg : 'white',
                  color: progress === opt.value ? opt.color : '#666',
                  fontWeight: progress === opt.value ? 700 : 400,
                  fontSize: 13, cursor: 'pointer', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: 8
                }}>
                  <span>{progress === opt.value ? '●' : '○'}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #eee' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: '#1a1a1a' }}>Row counter</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <button onClick={() => setRowCount(Math.max(0, rowCount - 1))} style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid #eee', background: 'white', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, fontWeight: 700, color: '#3C3489' }}>{rowCount}</div>
                <div style={{ fontSize: 12, color: '#999' }}>rows</div>
              </div>
              <button onClick={() => setRowCount(rowCount + 1)} style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: '#3C3489', color: 'white', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
            </div>
            <button onClick={() => setRowCount(0)} style={{ width: '100%', padding: '7px', borderRadius: 8, border: '1px solid #eee', background: 'white', color: '#999', fontSize: 12, cursor: 'pointer' }}>Reset</button>
          </div>

          <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #eee' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: '#1a1a1a' }}>Stitch counter</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <button onClick={() => setStitchCount(Math.max(0, stitchCount - 1))} style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid #eee', background: 'white', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, fontWeight: 700, color: '#3C3489' }}>{stitchCount}</div>
                <div style={{ fontSize: 12, color: '#999' }}>stitches</div>
              </div>
              <button onClick={() => setStitchCount(stitchCount + 1)} style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: '#3C3489', color: 'white', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
            </div>
            <button onClick={() => setStitchCount(0)} style={{ width: '100%', padding: '7px', borderRadius: 8, border: '1px solid #eee', background: 'white', color: '#999', fontSize: 12, cursor: 'pointer' }}>Reset</button>
          </div>

          <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #eee' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: '#1a1a1a' }}>My notes</h3>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Use 5mm hook, rows 1-10 done, need more yarn..."
              style={{ width: '100%', height: 120, padding: '10px 12px', borderRadius: 10, border: '1.5px solid #eee', fontSize: 13, outline: 'none', resize: 'none', fontFamily: 'system-ui', boxSizing: 'border-box', lineHeight: 1.6 }} />
          </div>

          {message && (
            <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, textAlign: 'center' }}>
              {message}
            </div>
          )}

          <button onClick={saveTracker} disabled={saving} style={{ padding: '14px', borderRadius: 12, border: 'none', background: '#3C3489', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            {saving ? 'Saving...' : saved ? 'Update my progress' : 'Save to my patterns'}
          </button>

          {!user && (
            <p style={{ fontSize: 12, color: '#999', textAlign: 'center' }}>
              <a href="/login" style={{ color: '#3C3489', fontWeight: 600 }}>Log in</a> to save your progress
            </p>
          )}

        </div>
      </div>
    </div>
  )
}