'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Admin() {
  const [patterns, setPatterns] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [editingId, setEditingId] = useState(null)

  const empty = {
    title: '', author: '', difficulty: 'Beginner',
    time_estimate: 'Under 2h', category: 'Accessories',
    format: 'both', tutorial_url: '', image_url: '',
    yarn_image_url: '', hook_image_url: '',   // ← ADDED
    description: '', yarn_affiliate: '', yarn_name: '',
    yarn_price: '', hook_affiliate: '', hook_name: '',
    hook_price: '', hook_size: '', yarn_weight: '', yarn_type: '', tags: '', is_published: true
  }

  const [urlInput, setUrlInput] = useState('')
  const [fetching, setFetching] = useState(false)
  const [fetchMessage, setFetchMessage] = useState('')

  async function fetchFromUrl() {
    if (!urlInput) return
    setFetching(true)
    setFetchMessage('')
    try {
      const res = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput })
      })
      const data = await res.json()
      if (data.error) {
        setFetchMessage('Could not fetch: ' + data.error)
      } else {
        setForm(f => ({
          ...f,
          title: data.title || f.title,
          description: data.description || f.description,
          image_url: data.image || f.image_url,
          author: data.author || f.author,
          tutorial_url: urlInput
        }))
        setFetchMessage('Details imported! Check and edit below.')
      }
    } catch(e) {
      setFetchMessage('Failed to fetch URL')
    }
    setFetching(false)
  }

  const [urlInput, setUrlInput] = useState('')
  const [fetching, setFetching] = useState(false)
  const [fetchMessage, setFetchMessage] = useState('')

  async function fetchFromUrl() {
    if (!urlInput) return
    setFetching(true)
    setFetchMessage('')
    try {
      const res = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput })
      })
      const data = await res.json()
      if (data.error) {
        setFetchMessage('Could not fetch: ' + data.error)
      } else {
        setForm(f => ({
          ...f,
          title: data.title || f.title,
          description: data.description || f.description,
          image_url: data.image || f.image_url,
          author: data.author || f.author,
          tutorial_url: urlInput
        }))
        setFetchMessage('Details imported! Check and edit below.')
      }
    } catch(e) {
      setFetchMessage('Failed to fetch URL')
    }
    setFetching(false)
  }

  const [form, setForm] = useState(empty)

  useEffect(() => { fetchPatterns() }, [])

  async function fetchPatterns() {
    const { data } = await supabase
      .from('patterns')
      .select('*')
      .order('created_at', { ascending: false })
    setPatterns(data || [])
  }

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit() {
    setLoading(true)
    setMessage('')
    if (!form.title || !form.tutorial_url) {
      setMessage('Title and tutorial URL are required')
      setLoading(false)
      return
    }
    let result
    if (editingId) {
      result = await supabase.from('patterns').update(form).eq('id', editingId)
    } else {
      result = await supabase.from('patterns').insert([form])
    }
    if (result.error) {
      setMessage('Error: ' + result.error.message)
    } else {
      setMessage(editingId ? 'Pattern updated!' : 'Pattern added!')
      setForm(empty)
      setEditingId(null)
      fetchPatterns()
    }
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this pattern?')) return
    await supabase.from('patterns').delete().eq('id', id)
    fetchPatterns()
  }

  function handleEdit(p) {
    setForm({
      title: p.title || '',
      author: p.author || '',
      difficulty: p.difficulty || 'Beginner',
      time_estimate: p.time_estimate || 'Under 2h',
      category: p.category || 'Accessories',
      format: p.format || 'both',
      tutorial_url: p.tutorial_url || '',
      image_url: p.image_url || '',
      yarn_image_url: p.yarn_image_url || '',   // ← ADDED
      hook_image_url: p.hook_image_url || '',   // ← ADDED
      description: p.description || '',
      yarn_affiliate: p.yarn_affiliate || '',
      yarn_name: p.yarn_name || '',
      yarn_price: p.yarn_price || '',
      hook_affiliate: p.hook_affiliate || '',
      hook_name: p.hook_name || '',
      hook_price: p.hook_price || '',
      hook_size: p.hook_size || '',
      yarn_weight: p.yarn_weight || '',
      yarn_type: p.yarn_type || '',
      tags: p.tags || '',
      is_published: p.is_published
    })
    setEditingId(p.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const inp = (label, field, placeholder) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>{label}</label>
      <input type="text" value={form[field]} placeholder={placeholder || ''}
        onChange={e => set(field, e.target.value)}
        style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #eee', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
    </div>
  )

  const sel = (label, field, options) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>{label}</label>
      <select value={form[field]} onChange={e => set(field, e.target.value)}
        style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #eee', fontSize: 14, outline: 'none', background: 'white', boxSizing: 'border-box' }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#3C3489', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ color: 'white', fontSize: 20, fontWeight: 700, margin: 0 }}>Loopbase Admin</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: 0 }}>Pattern management</p>
        </div>
        <a href="/" style={{ color: 'white', fontSize: 13, textDecoration: 'none', background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: 20 }}>View site</a>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24, display: 'grid', gridTemplateColumns: '400px 1fr', gap: 24 }}>

        {/* LEFT COLUMN — FORM */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #eee', alignSelf: 'start' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: '#1a1a1a' }}>
            {editingId ? 'Edit pattern' : 'Add new pattern'}
          </h2>

          <div style={{ marginBottom: 16, background: '#e8f5e9', borderRadius: 12, padding: 16, border: '1.5px solid #c8e6c9' }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#2e7d32', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Bulk import from spreadsheet
            </label>
            <p style={{ fontSize: 12, color: '#4b7a52', marginBottom: 10 }}>Upload your filled-in Excel template to import multiple patterns at once</p>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={e => e.target.files[0] && handleImportXLSX(e.target.files[0])}
              style={{ fontSize: 13, marginBottom: 8 }}
            />
            {importing && <p style={{ fontSize: 12, color: '#2e7d32', fontWeight: 600 }}>Importing patterns...</p>}
            {importMessage && (
              <p style={{ fontSize: 12, marginTop: 4, color: importMessage.includes('Error') || importMessage.includes('Failed') ? '#c62828' : '#2e7d32', fontWeight: 600 }}>{importMessage}</p>
            )}
          </div>

          <div style={{ marginBottom: 16, background: '#e8f5e9', borderRadius: 12, padding: 16, border: '1.5px solid #c8e6c9' }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#2e7d32', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Bulk import from spreadsheet
            </label>
            <p style={{ fontSize: 12, color: '#4b7a52', marginBottom: 10 }}>Upload your filled-in Excel template to import multiple patterns at once</p>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={e => e.target.files[0] && handleImportXLSX(e.target.files[0])}
              style={{ fontSize: 13, marginBottom: 8 }}
            />
            {importing && <p style={{ fontSize: 12, color: '#2e7d32', fontWeight: 600 }}>Importing patterns...</p>}
            {importMessage && (
              <p style={{ fontSize: 12, marginTop: 4, color: importMessage.includes('Error') || importMessage.includes('Failed') ? '#c62828' : '#2e7d32', fontWeight: 600 }}>{importMessage}</p>
            )}
          </div>

          <div style={{ marginBottom: 20, background: '#f5f3ff', borderRadius: 12, padding: 16, border: '1.5px solid #ede9fe' }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#3C3489', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Auto-fill from URL
            </label>
            <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>Paste a YouTube or blog URL to automatically import title, image and description</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                placeholder="https://youtube.com/watch?v=... or blog URL"
                style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: '1.5px solid #ede9fe', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                onKeyDown={e => e.key === 'Enter' && fetchFromUrl()}
              />
              <button onClick={fetchFromUrl} disabled={fetching} style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: '#3C3489', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {fetching ? 'Fetching...' : 'Import'}
              </button>
            </div>
            {fetchMessage && (
              <p style={{ fontSize: 12, marginTop: 8, color: fetchMessage.includes('Could not') ? '#c62828' : '#2e7d32', fontWeight: 600 }}>{fetchMessage}</p>
            )}
          </div>

          {inp('Title *', 'title', 'e.g. Chunky Beanie Hat')}
          {inp('Author', 'author', 'e.g. CozyStitches')}
          {sel('Difficulty', 'difficulty', ['Beginner', 'Intermediate', 'Advanced'])}
          {sel('Time estimate', 'time_estimate', ['Under 2h', '2-5h', '5h+'])}
          {sel('Category', 'category', ['Accessories', 'Home', 'Toys', 'Garments', 'Baby', 'Other'])}
          {sel('Format', 'format', ['both', 'video', 'pattern'])}
          {inp('Tutorial URL *', 'tutorial_url', 'https://...')}
          {inp('Image URL', 'image_url', 'https://...')}
          {inp('Yarn Image URL', 'yarn_image_url', 'https://...')}
          {inp('Hook Image URL', 'hook_image_url', 'https://...')}

          {form.image_url && (
            <img src={form.image_url} alt="preview"
              style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 14 }} />
          )}

          {inp('Description', 'description', 'One sentence about this pattern')}
          {inp('Yarn affiliate link', 'yarn_affiliate', 'https://...')}
          {inp('Yarn product name', 'yarn_name', 'e.g. Hobbii Rainbow Cotton')}
          {inp('Yarn price', 'yarn_price', 'e.g. £3.99')}
          {inp('Hook affiliate link', 'hook_affiliate', 'https://...')}
          {inp('Hook product name', 'hook_name', 'e.g. Clover Amour 4mm')}
          {inp('Hook price', 'hook_price', 'e.g. £8.50')}
          {inp('Hook size', 'hook_size', 'e.g. 5mm, 6mm')}
          {inp('Yarn weight', 'yarn_weight', 'e.g. Chunky, DK, Aran, Super Chunky')}
          {inp('Yarn type', 'yarn_type', 'e.g. Cotton, Wool, Acrylic, T-Shirt Yarn')}
          {inp('Tags', 'tags', 'e.g. summer, quick make, gift idea, colourful')}

          <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={form.is_published}
              onChange={e => set('is_published', e.target.checked)} id="pub" />
            <label htmlFor="pub" style={{ fontSize: 14, color: '#555' }}>Published</label>
          </div>

          {message && (
            <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13,
              background: message.includes('Error') ? '#fce4ec' : '#e8f5e9',
              color: message.includes('Error') ? '#c62828' : '#2e7d32' }}>
              {message}
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading}
            style={{ width: '100%', padding: '12px', borderRadius: 10, border: 'none', background: '#3C3489', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 8 }}>
            {loading ? 'Saving...' : editingId ? 'Update pattern' : 'Add pattern'}
          </button>

          {editingId && (
            <button onClick={() => { setForm(empty); setEditingId(null) }}
              style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1.5px solid #eee', background: 'white', color: '#555', fontSize: 14, cursor: 'pointer' }}>
              Cancel edit
            </button>
          )}
        </div>

        {/* RIGHT COLUMN — PATTERN LIST */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#1a1a1a' }}>
            All patterns ({patterns.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {patterns.map(p => (
              <div key={p.id} style={{ background: 'white', borderRadius: 12, padding: '14px 16px', border: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 12 }}>

                {p.image_url && (
                  <img
                    src={p.image_url}
                    alt={p.title}
                    style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }}
                  />
                )}

                {p.yarn_image_url && (
                  <img
                    src={p.yarn_image_url}
                    alt="Yarn"
                    style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }}
                  />
                )}

                {p.hook_image_url && (
                  <img
                    src={p.hook_image_url}
                    alt="Hook"
                    style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }}
                  />
                )}

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#1a1a1a' }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>by {p.author} · {p.difficulty} · {p.time_estimate}</div>
                  <span style={{ fontSize: 11, background: p.is_published ? '#e8f5e9' : '#fff8e1', color: p.is_published ? '#2e7d32' : '#f57f17', padding: '2px 6px', borderRadius: 6 }}>
                    {p.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleEdit(p)}
                    style={{ padding: '6px 14px', borderRadius: 8, border: '1.5px solid #3C3489', background: 'white', color: '#3C3489', fontSize: 13, cursor: 'pointer' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(p.id)}
                    style={{ padding: '6px 14px', borderRadius: 8, border: '1.5px solid #ffcdd2', background: 'white', color: '#c62828', fontSize: 13, cursor: 'pointer' }}>
                    Delete
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
