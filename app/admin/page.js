'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Admin() {
  const [patterns, setPatterns] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    title: '', author: '', difficulty: 'Beginner',
    time_estimate: 'Under 2h', category: 'Accessories',
    format: 'both', tutorial_url: '', image_url: '',
    yarn_image_url: '', hook_image_url: '',
    description: '', yarn_affiliate: '', yarn_name: '',
    yarn_price: '', hook_affiliate: '', hook_name: '',
    hook_price: '', hook_size: '', yarn_weight: '', yarn_type: '', tags: '', is_published: true
  })
  const [urlInput, setUrlInput] = useState('')
  const [aiFilling, setAiFilling] = useState(false)
  const [aiMessage, setAiMessage] = useState('')
  const [fetching, setFetching] = useState(false)
  const [fetchMessage, setFetchMessage] = useState('')
  const [importing, setImporting] = useState(false)
  const [importMessage, setImportMessage] = useState('')
  const [affiliateProducts, setAffiliateProducts] = useState([])
  const [activeTab, setActiveTab] = useState('patterns')
  const [productForm, setProductForm] = useState({
    type: 'yarn', name: '', affiliate_url: '', image_url: '',
    price: '', yarn_weight: '', yarn_type: '', hook_size: ''
  })
  const [productMessage, setProductMessage] = useState('')
  const [savingProduct, setSavingProduct] = useState(false)
  const [editingProductId, setEditingProductId] = useState(null)

  const empty = {
    title: '', author: '', difficulty: 'Beginner',
    time_estimate: 'Under 2h', category: 'Accessories',
    format: 'both', tutorial_url: '', image_url: '',
    yarn_image_url: '', hook_image_url: '',
    description: '', yarn_affiliate: '', yarn_name: '',
    yarn_price: '', hook_affiliate: '', hook_name: '',
    hook_price: '', hook_size: '', yarn_weight: '', yarn_type: '', tags: '', is_published: true
  }

  const emptyProduct = {
    type: 'yarn', name: '', affiliate_url: '', image_url: '',
    price: '', yarn_weight: '', yarn_type: '', hook_size: ''
  }

  useEffect(() => {
    fetchPatterns()
    fetchAffiliateProducts()
  }, [])

  async function fetchPatterns() {
    const { data } = await supabase.from('patterns').select('*').order('created_at', { ascending: false })
    setPatterns(data || [])
  }

  async function fetchAffiliateProducts() {
    const { data } = await supabase.from('affiliate_products').select('*').order('type')
    setAffiliateProducts(data || [])
  }

  async function handleSaveProduct() {
    setSavingProduct(true)
    setProductMessage('')
    if (!productForm.name || !productForm.affiliate_url) {
      setProductMessage('Name and affiliate URL are required')
      setSavingProduct(false)
      return
    }
    const payload = {
      type: productForm.type,
      name: productForm.name,
      affiliate_url: productForm.affiliate_url,
      image_url: productForm.image_url || null,
      price: productForm.price || null,
      yarn_weight: productForm.type === 'yarn' ? productForm.yarn_weight || null : null,
      yarn_type: productForm.type === 'yarn' ? productForm.yarn_type || null : null,
      hook_size: productForm.type === 'hook' ? productForm.hook_size || null : null,
    }
    let result
    if (editingProductId) {
      result = await supabase.from('affiliate_products').update(payload).eq('id', editingProductId)
    } else {
      result = await supabase.from('affiliate_products').insert([payload])
    }
    if (result.error) {
      setProductMessage('Error: ' + result.error.message)
    } else {
      setProductMessage(editingProductId ? 'Product updated!' : 'Product added!')
      setProductForm(emptyProduct)
      setEditingProductId(null)
      fetchAffiliateProducts()
    }
    setSavingProduct(false)
  }

  async function handleDeleteProduct(id) {
    if (!confirm('Delete this product?')) return
    const { error } = await supabase.from('affiliate_products').delete().eq('id', id)
    if (error) { alert('Delete error: ' + error.message); return }
    setAffiliateProducts(prev => prev.filter(p => p.id !== id))
  }

  function handleEditProduct(p) {
    setProductForm({
      type: p.type, name: p.name, affiliate_url: p.affiliate_url,
      image_url: p.image_url || '', price: p.price || '',
      yarn_weight: p.yarn_weight || '', yarn_type: p.yarn_type || '', hook_size: p.hook_size || '',
    })
    setEditingProductId(p.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleAiFill() {
    if (!form.title && !form.tutorial_url) {
      setAiMessage('Please import a URL first or enter a title')
      return
    }
    setAiFilling(true)
    setAiMessage('')
    try {
      const res = await fetch('/api/ai-fill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, description: form.description, url: form.tutorial_url, author: form.author, products: affiliateProducts })
      })
      const data = await res.json()
      if (data.error) {
        setAiMessage('Error: ' + data.error)
      } else {
        setForm(f => ({
          ...f,
          description: data.description || f.description,
          hook_size: data.hook_size || f.hook_size,
          yarn_weight: data.yarn_weight || f.yarn_weight,
          yarn_type: data.yarn_type || f.yarn_type,
          tags: data.tags || f.tags,
          difficulty: data.difficulty || f.difficulty,
          time_estimate: data.time_estimate || f.time_estimate,
          category: data.category || f.category,
          yarn_affiliate: data.yarn_affiliate || f.yarn_affiliate,
          yarn_name: data.yarn_name || f.yarn_name,
          yarn_price: data.yarn_price || f.yarn_price,
          yarn_image_url: data.yarn_image_url || f.yarn_image_url,
          hook_affiliate: data.hook_affiliate || f.hook_affiliate,
          hook_name: data.hook_name || f.hook_name,
          hook_price: data.hook_price || f.hook_price,
          hook_image_url: data.hook_image_url || f.hook_image_url,
        }))
        setAiMessage('AI filled in the details! Check and adjust if needed.')
      }
    } catch(e) {
      setAiMessage('Failed: ' + e.message)
    }
    setAiFilling(false)
  }

  async function handleImportXLSX(file) {
    setImporting(true)
    setImportMessage('')
    try {
      await new Promise((resolve, reject) => {
        if (window.XLSX) { resolve(); return; }
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })
      const XLSX = window.XLSX
      const buffer = await file.arrayBuffer()
      const uint8 = new Uint8Array(buffer)
      const wb = XLSX.read(uint8, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '' })
      const filtered = rows.filter(r => r.title && r.tutorial_url)
      if (!filtered.length) {
        setImportMessage('No valid patterns found.')
        setImporting(false)
        return
      }
      const res = await fetch('/api/import-patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patterns: filtered })
      })
      const data = await res.json()
      if (data.error) {
        setImportMessage('Error: ' + data.error)
      } else {
        setImportMessage(data.count + ' patterns imported!' + (data.skipped ? ' ' + data.skipped + ' skipped.' : ''))
        fetchPatterns()
      }
    } catch(e) {
      setImportMessage('Failed to import: ' + e.message)
    }
    setImporting(false)
  }

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
        const combined = (data.title || '').toLowerCase() + ' ' + (data.description || '').toLowerCase()
        const difficulty = combined.includes('beginner') || combined.includes('easy') ? 'Beginner'
          : combined.includes('advanced') || combined.includes('complex') ? 'Advanced' : 'Intermediate'
        const format = urlInput.includes('youtube.com') || urlInput.includes('youtu.be') ? 'video' : 'pattern'
        const category = combined.includes('hat') || combined.includes('beanie') || combined.includes('scarf') || combined.includes('bag') ? 'Accessories'
          : combined.includes('blanket') || combined.includes('pillow') || combined.includes('home') ? 'Home'
          : combined.includes('amigurumi') || combined.includes('toy') || combined.includes('plush') ? 'Toys'
          : combined.includes('top') || combined.includes('cardigan') || combined.includes('sweater') ? 'Garments'
          : combined.includes('baby') || combined.includes('newborn') ? 'Baby' : 'Accessories'
        const time = combined.includes('quick') || combined.includes('fast') || combined.includes('beginner') ? 'Under 2h' : '2-5h'
        setForm(f => ({
          ...f,
          title: data.title || f.title,
          description: data.description || f.description,
          image_url: data.image || f.image_url,
          author: data.author || f.author,
          tutorial_url: urlInput,
          difficulty, format, category, time_estimate: time
        }))
        setFetchMessage('Details imported! Check and edit below.')
      }
    } catch(e) {
      setFetchMessage('Failed to fetch URL')
    }
    setFetching(false)
  }

  function set(field, value) { setForm(f => ({ ...f, [field]: value })) }

  async function handleSubmit() {
    setLoading(true)
    setMessage('')
    if (!form.title || !form.tutorial_url) {
      setMessage('Title and tutorial URL are required')
      setLoading(false)
      return
    }
    const cleanForm = {
      title: form.title, author: form.author, difficulty: form.difficulty,
      time_estimate: form.time_estimate, category: form.category, format: form.format,
      tutorial_url: form.tutorial_url, image_url: form.image_url,
      description: form.description, yarn_affiliate: form.yarn_affiliate,
      yarn_name: form.yarn_name, yarn_price: form.yarn_price,
      hook_affiliate: form.hook_affiliate, hook_name: form.hook_name,
      hook_price: form.hook_price, hook_size: form.hook_size,
      yarn_weight: form.yarn_weight, yarn_type: form.yarn_type,
      tags: form.tags, is_published: form.is_published
    }
    let result
    if (editingId) {
      result = await supabase.from('patterns').update(cleanForm).eq('id', editingId)
    } else {
      result = await supabase.from('patterns').insert([cleanForm])
    }
    if (result.error) {
      setMessage('Error: ' + result.error.message)
    } else {
      setMessage(editingId ? 'Pattern updated!' : 'Pattern added!')
      setForm(empty)
      setEditingId(null)
      await new Promise(r => setTimeout(r, 300))
      fetchPatterns()
    }
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this pattern?')) return
    const { data, error } = await supabase.from('patterns').delete().eq('id', id).select()
    console.log('Delete result:', data, error)
    if (error) { alert('Delete error: ' + error.message); return }
    if (!data || data.length === 0) { alert('Delete failed - check Supabase RLS policies'); return }
    setPatterns(prev => prev.filter(p => p.id !== id))
  }

  function handleEdit(p) {
    setForm({
      title: p.title || '', author: p.author || '',
      difficulty: p.difficulty || 'Beginner', time_estimate: p.time_estimate || 'Under 2h',
      category: p.category || 'Accessories', format: p.format || 'both',
      tutorial_url: p.tutorial_url || '', image_url: p.image_url || '',
      yarn_image_url: p.yarn_image_url || '', hook_image_url: p.hook_image_url || '',
      description: p.description || '', yarn_affiliate: p.yarn_affiliate || '',
      yarn_name: p.yarn_name || '', yarn_price: p.yarn_price || '',
      hook_affiliate: p.hook_affiliate || '', hook_name: p.hook_name || '',
      hook_price: p.hook_price || '', hook_size: p.hook_size || '',
      yarn_weight: p.yarn_weight || '', yarn_type: p.yarn_type || '',
      tags: p.tags || '', is_published: p.is_published
    })
    setEditingId(p.id)
    setActiveTab('patterns')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const inp = (label, field, placeholder) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>{label}</label>
      <input type="text" value={form[field]} placeholder={placeholder || ''} onChange={e => set(field, e.target.value)}
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

  const pinp = (label, field, placeholder) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>{label}</label>
      <input type="text" value={productForm[field]} placeholder={placeholder || ''}
        onChange={e => setProductForm(f => ({ ...f, [field]: e.target.value }))}
        style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #eee', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
    </div>
  )

  const yarnProducts = affiliateProducts.filter(p => p.type === 'yarn')
  const hookProducts = affiliateProducts.filter(p => p.type === 'hook')

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#3C3489', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ color: 'white', fontSize: 20, fontWeight: 700, margin: 0 }}>Loopbase Admin</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: 0 }}>Pattern management</p>
        </div>
        <a href="/" style={{ color: 'white', fontSize: 13, textDecoration: 'none', background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: 20 }}>View site</a>
      </div>

      <div style={{ background: 'white', borderBottom: '1px solid #eee', padding: '0 24px', display: 'flex' }}>
        {[['patterns', '📋 Patterns'], ['library', '🧶 Affiliate Library']].map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: '14px 20px', border: 'none', background: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', borderBottom: activeTab === tab ? '2px solid #3C3489' : '2px solid transparent', color: activeTab === tab ? '#3C3489' : '#888' }}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'patterns' && (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24, display: 'grid', gridTemplateColumns: '400px 1fr', gap: 24 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #eee', alignSelf: 'start' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: '#1a1a1a' }}>{editingId ? 'Edit pattern' : 'Add new pattern'}</h2>

            <div style={{ marginBottom: 16, background: '#e8f5e9', borderRadius: 12, padding: 16, border: '1.5px solid #c8e6c9' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#2e7d32', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Bulk import from spreadsheet</label>
              <p style={{ fontSize: 12, color: '#4b7a52', marginBottom: 10 }}>Upload your filled-in Excel template to import multiple patterns at once</p>
              <label style={{ display: 'inline-block', padding: '9px 18px', borderRadius: 8, background: '#2e7d32', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 8 }}>
                Upload spreadsheet
                <input type="file" accept=".xlsx,.xls" onChange={e => e.target.files[0] && handleImportXLSX(e.target.files[0])} style={{ display: 'none' }} />
              </label>
              {importing && <p style={{ fontSize: 12, color: '#2e7d32', fontWeight: 600 }}>Importing...</p>}
              {importMessage && <p style={{ fontSize: 12, marginTop: 4, color: importMessage.includes('Error') ? '#c62828' : '#2e7d32', fontWeight: 600 }}>{importMessage}</p>}
            </div>

            <div style={{ marginBottom: 20, background: '#f5f3ff', borderRadius: 12, padding: 16, border: '1.5px solid #ede9fe' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#3C3489', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Auto-fill from URL</label>
              <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>Paste a YouTube or blog URL to automatically import title, image and description</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="text" value={urlInput} onChange={e => setUrlInput(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: '1.5px solid #ede9fe', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  onKeyDown={e => e.key === 'Enter' && fetchFromUrl()} />
                <button onClick={fetchFromUrl} disabled={fetching}
                  style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: '#3C3489', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {fetching ? 'Fetching...' : 'Import'}
                </button>
              </div>
              {fetchMessage && <p style={{ fontSize: 12, marginTop: 8, color: fetchMessage.includes('Could not') ? '#c62828' : '#2e7d32', fontWeight: 600 }}>{fetchMessage}</p>}
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

            {form.image_url && <img src={form.image_url} alt="preview" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 14 }} />}

            <div style={{ marginBottom: 16, background: '#f0f7ff', borderRadius: 12, padding: 16, border: '1.5px solid #bdd7f5' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1565c0', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>AI auto-fill</label>
              <p style={{ fontSize: 12, color: '#1976d2', marginBottom: 10 }}>
                Fills description, tags, difficulty — and picks the best yarn & hook from your affiliate library
                {affiliateProducts.length > 0 ? ` (${yarnProducts.length} yarns, ${hookProducts.length} hooks loaded)` : ' — add products in the Affiliate Library tab first!'}
              </p>
              <button onClick={handleAiFill} disabled={aiFilling}
                style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: '#1565c0', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                {aiFilling ? 'AI is thinking...' : 'Auto-fill with AI'}
              </button>
              {aiMessage && <p style={{ fontSize: 12, marginTop: 8, color: aiMessage.includes('Error') || aiMessage.includes('Failed') ? '#c62828' : '#1565c0', fontWeight: 600 }}>{aiMessage}</p>}
            </div>

            {inp('Description', 'description', 'One sentence about this pattern')}
            {inp('Yarn affiliate link', 'yarn_affiliate', 'https://...')}
            {inp('Yarn product name', 'yarn_name', 'e.g. Hobbii Rainbow Cotton')}
            {inp('Yarn price', 'yarn_price', 'e.g. £3.99')}
            {inp('Hook affiliate link', 'hook_affiliate', 'https://...')}
            {inp('Hook product name', 'hook_name', 'e.g. Clover Amour 4mm')}
            {inp('Hook price', 'hook_price', 'e.g. £8.50')}
            {inp('Hook size', 'hook_size', 'e.g. 5mm, 6mm')}
            {inp('Yarn weight', 'yarn_weight', 'e.g. Chunky, DK, Aran')}
            {inp('Yarn type', 'yarn_type', 'e.g. Cotton, Wool, Acrylic')}
            {inp('Tags', 'tags', 'e.g. summer, quick make, gift idea')}

            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={form.is_published} onChange={e => set('is_published', e.target.checked)} id="pub" />
              <label htmlFor="pub" style={{ fontSize: 14, color: '#555' }}>Published</label>
            </div>

            {message && <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13, background: message.includes('Error') ? '#fce4ec' : '#e8f5e9', color: message.includes('Error') ? '#c62828' : '#2e7d32' }}>{message}</div>}

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

          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#1a1a1a' }}>All patterns ({patterns.length})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {patterns.map(p => (
                <div key={p.id} style={{ background: 'white', borderRadius: 12, padding: '14px 16px', border: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 12 }}>
                  {p.image_url && <img src={p.image_url} alt={p.title} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#1a1a1a' }}>{p.title}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>by {p.author} · {p.difficulty} · {p.time_estimate}</div>
                    <span style={{ fontSize: 11, background: p.is_published ? '#e8f5e9' : '#fff8e1', color: p.is_published ? '#2e7d32' : '#f57f17', padding: '2px 6px', borderRadius: 6 }}>
                      {p.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleEdit(p)} style={{ padding: '6px 14px', borderRadius: 8, border: '1.5px solid #3C3489', background: 'white', color: '#3C3489', fontSize: 13, cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDelete(p.id)} style={{ padding: '6px 14px', borderRadius: 8, border: '1.5px solid #ffcdd2', background: 'white', color: '#c62828', fontSize: 13, cursor: 'pointer' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'library' && (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24, display: 'grid', gridTemplateColumns: '360px 1fr', gap: 24 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #eee', alignSelf: 'start' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: '#1a1a1a' }}>{editingProductId ? 'Edit product' : 'Add affiliate product'}</h2>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>Type</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[['yarn', '🧶 Yarn'], ['hook', '🪝 Hook']].map(([t, label]) => (
                  <button key={t} onClick={() => setProductForm(f => ({ ...f, type: t }))}
                    style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1.5px solid', borderColor: productForm.type === t ? '#3C3489' : '#eee', background: productForm.type === t ? '#f5f3ff' : 'white', color: productForm.type === t ? '#3C3489' : '#888', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {pinp('Product name *', 'name', productForm.type === 'yarn' ? 'e.g. Hobbii Rainbow Cotton DK' : 'e.g. Clover Amour 5mm')}
            {pinp('Affiliate URL *', 'affiliate_url', 'https://amazon.co.uk/...')}
            {pinp('Image URL', 'image_url', 'https://...')}
            {pinp('Price', 'price', 'e.g. £3.99')}

            {productForm.type === 'yarn' && <>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>Yarn weight</label>
                <select value={productForm.yarn_weight} onChange={e => setProductForm(f => ({ ...f, yarn_weight: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #eee', fontSize: 14, outline: 'none', background: 'white', boxSizing: 'border-box' }}>
                  <option value="">Select weight...</option>
                  {['Lace', 'Fingering', 'Sport', 'DK', 'Aran', 'Chunky', 'Super Chunky', 'Jumbo'].map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              {pinp('Yarn type / fibre', 'yarn_type', 'e.g. 100% Cotton, Acrylic, Wool')}
            </>}

            {productForm.type === 'hook' && pinp('Hook size', 'hook_size', 'e.g. 5mm')}

            {productForm.image_url && <img src={productForm.image_url} alt="preview" style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8, marginBottom: 14 }} />}

            {productMessage && <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 13, background: productMessage.includes('Error') ? '#fce4ec' : '#e8f5e9', color: productMessage.includes('Error') ? '#c62828' : '#2e7d32' }}>{productMessage}</div>}

            <button onClick={handleSaveProduct} disabled={savingProduct}
              style={{ width: '100%', padding: '12px', borderRadius: 10, border: 'none', background: '#3C3489', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 8 }}>
              {savingProduct ? 'Saving...' : editingProductId ? 'Update product' : 'Add product'}
            </button>
            {editingProductId && (
              <button onClick={() => { setProductForm(emptyProduct); setEditingProductId(null); setProductMessage('') }}
                style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1.5px solid #eee', background: 'white', color: '#555', fontSize: 14, cursor: 'pointer' }}>
                Cancel edit
              </button>
            )}
          </div>

          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: '#1a1a1a' }}>🧶 Yarn ({yarnProducts.length})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
              {yarnProducts.length === 0 && <p style={{ fontSize: 13, color: '#999', background: 'white', padding: 16, borderRadius: 12, border: '1px solid #eee' }}>No yarn products yet.</p>}
              {yarnProducts.map(p => (
                <div key={p.id} style={{ background: 'white', borderRadius: 12, padding: '12px 16px', border: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 12 }}>
                  {p.image_url && <img src={p.image_url} alt={p.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>{[p.yarn_weight, p.yarn_type, p.price].filter(Boolean).join(' · ')}</div>
                    <a href={p.affiliate_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#3C3489' }}>View link ↗</a>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button onClick={() => handleEditProduct(p)} style={{ padding: '5px 12px', borderRadius: 7, border: '1.5px solid #3C3489', background: 'white', color: '#3C3489', fontSize: 12, cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDeleteProduct(p.id)} style={{ padding: '5px 12px', borderRadius: 7, border: '1.5px solid #ffcdd2', background: 'white', color: '#c62828', fontSize: 12, cursor: 'pointer' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: '#1a1a1a' }}>🪝 Hooks ({hookProducts.length})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {hookProducts.length === 0 && <p style={{ fontSize: 13, color: '#999', background: 'white', padding: 16, borderRadius: 12, border: '1px solid #eee' }}>No hook products yet.</p>}
              {hookProducts.map(p => (
                <div key={p.id} style={{ background: 'white', borderRadius: 12, padding: '12px 16px', border: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 12 }}>
                  {p.image_url && <img src={p.image_url} alt={p.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>{[p.hook_size, p.price].filter(Boolean).join(' · ')}</div>
                    <a href={p.affiliate_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#3C3489' }}>View link ↗</a>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button onClick={() => handleEditProduct(p)} style={{ padding: '5px 12px', borderRadius: 7, border: '1.5px solid #3C3489', background: 'white', color: '#3C3489', fontSize: 12, cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDeleteProduct(p.id)} style={{ padding: '5px 12px', borderRadius: 7, border: '1.5px solid #ffcdd2', background: 'white', color: '#c62828', fontSize: 12, cursor: 'pointer' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
