'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    setMessage('')
    let result
    if (mode === 'login') {
      result = await supabase.auth.signInWithPassword({ email, password })
    } else {
      result = await supabase.auth.signUp({ email, password })
    }
    if (result.error) {
      setMessage('Error: ' + result.error.message)
    } else {
      if (mode === 'signup') {
        setMessage('Account created! Check your email to confirm, then log in.')
      } else {
        window.location.href = '/'
      }
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', fontFamily: 'system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'white', borderRadius: 20, padding: 32, maxWidth: 400, width: '100%', border: '1px solid #eee' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#3C3489', margin: 0 }}>Loopbase</h1>
          <p style={{ fontSize: 13, color: '#999', marginTop: 4 }}>
            {mode === 'login' ? 'Welcome back!' : 'Create a free account'}
          </p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #eee', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #eee', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
        </div>

        {message && (
          <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13,
            background: message.includes('Error') ? '#fce4ec' : '#e8f5e9',
            color: message.includes('Error') ? '#c62828' : '#2e7d32' }}>
            {message}
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading}
          style={{ width: '100%', padding: '12px', borderRadius: 10, border: 'none', background: '#3C3489', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 16 }}>
          {loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#999', margin: 0 }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage('') }}
            style={{ background: 'none', border: 'none', color: '#3C3489', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
            {mode === 'login' ? 'Sign up free' : 'Log in'}
          </button>
        </p>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#ccc', marginTop: 16 }}>
          Loopbase is always free. No credit card needed.
        </p>
      </div>
    </div>
  )
}