'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Admin() {
  const [patterns, setPatterns] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [imageUploading, setImageUploading] = useState(false)

  const empty = {
    title: '', author: '', difficulty: 'Beginner',
    time_estimate: 'Under 2h', category: 'Accessories',
    format: 'both', tutorial_url: '', image_url: '',
    description: '', yarn_affiliate: '', hook_affiliate: '',
    is_published: true
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

  async function uploadImage(file) {
    setImageUploading(true)
    const data = new FormData()
    data.append('file', file)
    data.append('upload_preset', 'loopbase-patterns')
    const res = await fetch('https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload', {
      method: 'POST', body: data
    })
    const json = await res.json()
    setImageUploading(false)
    if (json.secure_url) {
      set('image_url', json.secure_url)
      setMessage('Image uploaded!')
    } else {
      setMessage('Image upload failed — paste a URL manually instead')
    }
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
      description: p.description || '',
      yarn_affiliate: p.yarn_affiliate || '',
      hook_affiliate: p.hook_affiliate || '',
      is_published: p.is_published
    })
    setEditingId(p.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const input = (label, field, type='text', opts={}) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>
        {label}
      </label>
      <input
        type={type}
        value={form[field]}
        onChange={e => set(field, e.target.value)}
        style={{
          width: '100%', padding: '9px 12px', borderRadius: 8,
          border: '1.5px solid #eee', fontSize: 14, outline: 'none',
          boxSizing: 'border-box'
        }}
        {...opts}
      />
    </div>
  )

  const select = (label, field, options) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>
        {label}
      </label>
      <select
        value={form[field]}
        onChange={e => set(field, e.target.value)}
        style={{
          width: '100%', padding: '9px 12px', borderRadius: 8,
          border: '1.5px solid #eee', fontSize: 14, outline: 'none',
          background: 'white', boxSizing: 'border-box'
        }}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', fontFamily: 'system-ui, sans-serif' }}>

      <div style={{ background: '#3C3489', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ color: 'white', fontSize: 20, fontWeight: 700, margin: 0 }}>🧶 Loopbase Admin</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: 0 }}>Pattern management</p>
        </div>
        <a href="/" style={{ color: 'white', fontSize: 13, textDecoration: 'none', background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: 20 }}>
          View site →
        </a>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24, display: 'grid', gridTemplateColumns: '400px 1fr', gap: 24 }}>

        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #eee', alignSelf: 'start' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: '#1a1a1a' }}>
            {editingId ? 'Edit pattern' : 'Add new pattern'}
          </h2>

          {input('Title *', 'title', 'text', { placeholder: 'e.g. Chunky Beanie Hat' })}
          {input('Author', 'author', 'text', { placeholder: 'e.g. CozyStitches' })}
          {select('Difficulty', 'difficulty', ['Beginner', 'Intermediate', 'Advanced'])}
          {select('Time estimate', 'time_estimate', ['Under 2h', '2-5h', '5h+'])}
          {select('Category', 'category', ['Accessories', 'Home', 'Toys', 'Garments', 'Baby', 'Other'])}
          {select('Format', 'format', ['both', 'video', 'pattern'])}
          {input('Tutorial URL *', 'tutorial_url', 'text', { placeholder: 'https://...' })}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>
              Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={e => e.target.files[0] && uploadImage(e.target.files[0])}
              style={{ marginBottom: 8, fontSize: 13 }}
            />
            <input
              type="text"
              placeholder="Or paste image URL directly"
              value={form.image_url}
              onChange={e => set('image_url', e.target.value)}
              style={{
                width: '100%', padding: '9px 12px', borderRadius: 8,
                border: '1.5px solid #eee', fontSize: 14, outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {imageUploading && <p style={{ fontSize: 12, color: '#999', margin: '4px 0 0' }}>Uploading image...</p>}
            {form.image_url && (
              <img src={form.image_url} alt="preview"
                style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} />
            )}
          </div>

          {input('Description', 'description', 'text', { placeholder: 'One sentence about this pattern' })}
          {input('Yarn affiliate link', 'yarn_affiliate', 'text', { placeholder: 'https://...' })}
          {input('Hook affiliate link', 'hook_affiliate', 'text', { placeholder: 'https://...' })}

          <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={e => set('is_published', e.target.checked)}
              id="published"
            />
            <label htmlFor="published" style={{ fontSize: 14, color: '#555' }}>Published (visible on site)</label>
          </div>

          {message && (
            <div style={{
              padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13,
              background: message.includes('Error') ? '#fce4ec' : '#e8f5e9',
              color: message.includes('Error') ? '#c62828' : '#2e7d32'
            }}>
              {message}
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading}
            style={{
              width: '100%', padding: '12px', borderRadius: 10, border: 'none',
              background: '#3C3489', color: 'white', fontSize: 15, fontWeight: 700,
              cursor: 'pointer', marginBottom: 8
            }}>
            {loading ? 'Saving...' : editingId ? 'Update pattern' : 'Add pattern'}
          </button>

          {editingId && (
            <button onClick={() => { setForm(empty); setEditingId(null) }}
              style={{
                width: '100%', padding: '10px', borderRadius: 10,
                border: '1.5px solid #eee', background: 'white',
                color: '#555', fontSize: 14, cursor: 'pointer'
              }}>
              Cancel edit
            </button>
          )}
        </div>

        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#1a1a1a' }}>
            All patterns ({patterns.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {patterns.map(p => (
              <div key={p.id} style={{
                background: 'white', borderRadius: 12, padding: '14px 16px',
                border: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 12
              }}>
                {p.image_url && (
                  <img src={p.image_url} alt={p.title}
                    style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#1a1a1a' }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>by {p.author} · {p.difficulty} · {p.time_estimate}</div>
                  <div style={{ fontSize: 11, marginTop: 2 }}>
                    <span style={{
                      background: p.is_published ? '#e8f5e9' : '#fff8e1',
                      color: p.is_published ? '#2e7d32' : '#f57f17',
                      padding: '2px 6px', borderRadius: 6
                    }}>
                      {p.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleEdit(p)}
                    style={{
                      padding: '6px 14px', borderRadius: 8, border: '1.5px solid #3C3489',
                      background: 'white', color: '#3C3489', fontSize: 13, cursor: 'pointer'
                    }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(p.id)}
                    style={{
                      padding: '6px 14px', borderRadius: 8, border: '1.5px solid #ffcdd2',
                      background: 'white', color: '#c62828', fontSize: 13, cursor: 'pointer'
                    }}>
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