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

export default function PatternDetailClient({ initialPattern = null, patternId = null }) {
  const params = useParams()
  const id = patternId || params.id
  const [pattern, setPattern] = useState(initialPattern)
  const [user, setUser] = useState(null)
  const [tracker, setTracker] = useState(null)
  const [notes, setNotes] = useState('')
  const [currentRow, setCurrentRow] = useState(1)
  const [stitchesThisRow, setStitchesThisRow] = useState(0)
  const [totalStitches, setTotalStitches] = useState(0)
  const [rowLog, setRowLog] = useState([])
  const [progress, setProgress] = useState('not_started')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!initialPattern) fetchPattern()
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
      setCurrentRow(data.row_count || 1)
      setTotalStitches(data.stitch_count || 0)
      setProgress(data.progress || 'not_started')
      if (data.row_log) {
        try { setRowLog(JSON.parse(data.row_log)) } catch(e) {}
      }
      setSaved(true)
    }
  }

  function completeRow() {
    const newLog = [...rowLog, { row: currentRow, stitches: stitchesThisRow }]
    const newTotal = totalStitches + stitchesThisRow
    setRowLog(newLog)
    setTotalStitches(newTotal)
    setCurrentRow(currentRow + 1)
    setStitchesThisRow(0)
  }

  function undoLastRow() {
    if (rowLog.length === 0) return
    const last = rowLog[rowLog.length - 1]
    setRowLog(rowLog.slice(0, -1))
    setTotalStitches(totalStitches - last.stitches)
    setCurrentRow(currentRow - 1)
  }

  async function saveTracker() {
    if (!user) { window.location.href = '/login'; return }
    setSaving(true)
    const payload = {
      user_id: user.id,
      pattern_id: id,
      notes,
      row_count: currentRow,
      stitch_count: totalStitches,
      progress,
      row_log: JSON.stringify(rowLog)
    }
    let error
    if (tracker) {
      const result = await supabase.from('saved_patterns').update(payload).eq('id', tracker.id)
      error = result.error
    } else {
      const result = await supabase.from('saved_patterns').insert([payload]).select().single()
      error = result.error
      if (result.data) setTracker(result.data)
    }
    setSaving(false)
    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setSaved(true)
      setMessage('Progress saved!')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const levelColor = (d) => {
    if (d === 'Beginner') return { background: '#e8f5e9', color: '#2e7d32' }
    if (d === 'Intermediate') return { background: '#fff8e1', color: '#f57f17' }
    if (d === 'Advanced') return { background: '#fce4ec', color: '#c62828' }
    return {}
  }

  const progressOptions = [
    { value: 'not_started', label: 'Not started', color: '#9e9e9e', bg: '#f5f5f5' },
    { value: 'in_progress', label: 'In progress', color: '#f57f17', bg: '#fff8e1' },
    { value: 'completed', label: 'Completed', color: '#2e7d32', bg: '#e8f5e9' },
  ]

  if (!pattern) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui' }}>
      <p style={{ color: '#999' }}>Loading...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7ff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* HEADER */}
      <div style={{ background: 'white', borderBottom: '1px solid #ede9fe', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 12px rgba(60,52,137,0.06)' }}>
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#3C3489' }}>Loopbase</span>
        </a>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {user && <a href="/saved" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none', padding: '7px 14px', borderRadius: 20, border: '1.5px solid #e5e7eb' }}>My patterns</a>}
          <a href="/" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none', padding: '7px 14px', borderRadius: 20, border: '1.5px solid #e5e7eb' }}>Back to browse</a>
        </div>
      </div>

      {/* PATTERN DETAILS — full width on top */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px 0' }}>

        {pattern.image_url && (
          <img src={pattern.image_url} alt={pattern.title}
            style={{ width: '100%', height: 340, objectFit: 'cover', borderRadius: 20, marginBottom: 24, display: 'block' }} />
        )}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          <span style={{ padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, ...levelColor(pattern.difficulty) }}>{pattern.difficulty}</span>
          <span style={{ background: '#ede9fe', color: '#5b21b6', padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500 }}>{pattern.time_estimate}</span>
          <span style={{ background: '#f0ede8', color: '#666', padding: '4px 14px', borderRadius: 20, fontSize: 13 }}>{pattern.category}</span>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 6, letterSpacing: '-0.5px' }}>{pattern.title}</h1>
        <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 16 }}>by {pattern.author}</p>

        {pattern.description && (
          <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.8, marginBottom: 24 }}>{pattern.description}</p>
        )}

        {/* Integrated details + affiliate table */}
        {[pattern.hook_size, pattern.yarn_weight, pattern.yarn_type, pattern.tags].some(Boolean) && (
          <div style={{ background: 'white', borderRadius: 16, border: '1.5px solid #ede9fe', overflow: 'hidden', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody>
              {pattern.hook_size && (
                <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 18px', fontSize: 13, color: '#9ca3af', width: 130, fontWeight: 500 }}>🪝 Hook size</td>
                  <td style={{ padding: '12px 18px', fontSize: 14, color: '#111827', fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>{pattern.hook_size}</span>
                      {pattern.hook_affiliate && (
                        <a href={pattern.hook_affiliate} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', background: '#f5f3ff', border: '1.5px solid #ede9fe', borderRadius: 8, padding: '5px 10px' }}>
                          {pattern.hook_image_url && <img src={pattern.hook_image_url} alt="hook" style={{ width: 24, height: 24, objectFit: 'cover', borderRadius: 4 }} />}
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: '#3C3489' }}>{pattern.hook_name || 'Shop hook'}</div>
                            {pattern.hook_price && <div style={{ fontSize: 10, color: '#9ca3af' }}>{pattern.hook_price}</div>}
                          </div>
                          <span style={{ fontSize: 11, color: '#3C3489', fontWeight: 700 }}>→</span>
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              )}
              {pattern.yarn_weight && (
                <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 18px', fontSize: 13, color: '#9ca3af', width: 130, fontWeight: 500 }}>🧶 Yarn weight</td>
                  <td style={{ padding: '12px 18px', fontSize: 14, color: '#111827', fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>{pattern.yarn_weight}</span>
                      {pattern.yarn_affiliate && (
                        <a href={pattern.yarn_affiliate} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', background: '#f5f3ff', border: '1.5px solid #ede9fe', borderRadius: 8, padding: '5px 10px' }}>
                          {pattern.yarn_image_url && <img src={pattern.yarn_image_url} alt="yarn" style={{ width: 24, height: 24, objectFit: 'cover', borderRadius: 4 }} />}
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: '#3C3489' }}>{pattern.yarn_name || 'Shop yarn'}</div>
                            {pattern.yarn_price && <div style={{ fontSize: 10, color: '#9ca3af' }}>{pattern.yarn_price}</div>}
                          </div>
                          <span style={{ fontSize: 11, color: '#3C3489', fontWeight: 700 }}>→</span>
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              )}
              {pattern.yarn_type && (
                <tr style={{ borderBottom: pattern.tags ? '1px solid #f3f4f6' : 'none' }}>
                  <td style={{ padding: '12px 18px', fontSize: 13, color: '#9ca3af', width: 130, fontWeight: 500 }}>✨ Yarn type</td>
                  <td style={{ padding: '12px 18px', fontSize: 14, color: '#111827', fontWeight: 600 }}>{pattern.yarn_type}</td>
                </tr>
              )}
              {pattern.tags && (
                <tr>
                  <td style={{ padding: '12px 18px', fontSize: 13, color: '#9ca3af', width: 130, fontWeight: 500 }}>🏷️ Tags</td>
                  <td style={{ padding: '12px 18px', fontSize: 14, color: '#111827', fontWeight: 600 }}>{pattern.tags}</td>
                </tr>
              )}
            </tbody></table>
          </div>
        )}

        {/* View pattern button */}
        <a href={pattern.tutorial_url} target="_blank" rel="noopener noreferrer"
          style={{ display: 'block', textAlign: 'center', background: '#3C3489', color: 'white', padding: '15px', borderRadius: 14, fontSize: 16, fontWeight: 700, textDecoration: 'none', marginBottom: 32, boxShadow: '0 4px 14px rgba(60,52,137,0.25)' }}>
          View free pattern →
        </a>
      </div>

      {/* TRACKER SECTION */}
      <div style={{ background: '#f8f7ff', padding: '40px 24px 60px', borderTop: '1px solid #ede9fe' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>

          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 6, letterSpacing: '-0.3px' }}>Track your progress</h2>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 28 }}>Log your rows and stitches as you go</p>

          {/* Progress status */}
          <div style={{ background: 'white', borderRadius: 16, padding: 20, marginBottom: 16, border: '1.5px solid #ede9fe' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Progress status</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {progressOptions.map(opt => (
                <button key={opt.value} onClick={() => setProgress(opt.value)} style={{
                  padding: '8px 16px', borderRadius: 20,
                  border: progress === opt.value ? '2px solid ' + opt.color : '1.5px solid #e5e7eb',
                  background: progress === opt.value ? opt.bg : 'white',
                  color: progress === opt.value ? opt.color : '#6b7280',
                  fontWeight: progress === opt.value ? 700 : 400,
                  fontSize: 13, cursor: 'pointer'
                }}>
                  {progress === opt.value ? '● ' : '○ '}{opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stitch tracker card — purple */}
          <div style={{ background: '#3C3489', borderRadius: 16, padding: 24, marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#C4BCE8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 20 }}>Stitch tracker</div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: 'white', lineHeight: 1 }}>{currentRow}</div>
                <div style={{ fontSize: 12, color: '#C4BCE8', marginTop: 4 }}>Current row</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: 'white', lineHeight: 1 }}>{totalStitches}</div>
                <div style={{ fontSize: 12, color: '#C4BCE8', marginTop: 4 }}>Total stitches</div>
              </div>
            </div>

            {/* Stitch counter */}
            <div style={{ marginBottom: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: '#C4BCE8', marginBottom: 16, fontWeight: 500 }}>Stitches in row {currentRow}</div>
              <div style={{ fontSize: 72, fontWeight: 700, color: 'white', lineHeight: 1, marginBottom: 20 }}>{stitchesThisRow}</div>
              <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
                <button onClick={() => setStitchesThisRow(Math.max(0, stitchesThisRow - 1))}
                  style={{ width: 60, height: 60, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', background: 'transparent', color: 'white', fontSize: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                <button onClick={() => setStitchesThisRow(stitchesThisRow + 1)}
                  style={{ width: 60, height: 60, borderRadius: '50%', border: 'none', background: 'white', color: '#3C3489', fontSize: 28, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
            </div>

            <button onClick={completeRow}
              style={{ width: '100%', padding: '13px', borderRadius: 12, border: '2px solid rgba(255,255,255,0.3)', background: 'transparent', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 10 }}>
              Complete row {currentRow} →
            </button>

            {rowLog.length > 0 && (
              <button onClick={undoLastRow}
                style={{ width: '100%', padding: '10px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer', marginBottom: 16 }}>
                Undo last row
              </button>
            )}

            {/* Row history */}
            {rowLog.length > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 12, color: '#C4BCE8', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Row history</div>
                <div style={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[...rowLog].reverse().map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.06)' }}>
                      <span style={{ fontSize: 13, color: '#C4BCE8', fontWeight: 600 }}>Row {r.row}</span>
                      <span style={{ fontSize: 13, color: 'white', fontWeight: 700 }}>{r.stitches} stitches</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div style={{ background: 'white', borderRadius: 16, padding: 20, marginBottom: 16, border: '1.5px solid #ede9fe' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>My notes</div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Use 5mm hook, rows 1-10 done, need more yarn..."
              style={{ width: '100%', height: 120, padding: '12px 14px', borderRadius: 12, border: '1.5px solid #ede9fe', background: '#faf9ff', fontSize: 13, outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box', lineHeight: 1.7, color: '#374151' }} />
          </div>

          {message && (
            <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, textAlign: 'center', marginBottom: 12 }}>
              {message}
            </div>
          )}

          <button onClick={saveTracker} disabled={saving}
            style={{ width: '100%', padding: '15px', borderRadius: 14, border: 'none', background: '#3C3489', color: 'white', fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(60,52,137,0.25)' }}>
            {saving ? 'Saving...' : saved ? 'Update my progress' : 'Save to my patterns'}
          </button>

          {!user && (
            <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 12 }}>
              <a href="/login" style={{ color: '#3C3489', fontWeight: 600 }}>Log in</a> to save your progress
            </p>
          )}

        </div>
      </div>
    </div>
  )
}
