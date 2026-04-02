'use client'
import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

function ConfirmInner() {
  const searchParams = useSearchParams()

  useEffect(() => {
    async function confirm() {
      const token_hash = searchParams.get('token_hash')
      const type = searchParams.get('type')
      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash, type })
        if (!error) {
          window.location.href = '/?confirmed=true'
        } else {
          window.location.href = '/login?error=confirmation_failed'
        }
      } else {
        window.location.href = '/'
      }
    }
    confirm()
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui', background: '#faf9f7' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🧶</div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#3C3489', marginBottom: 8 }}>Confirming your account...</h1>
        <p style={{ color: '#999', fontSize: 14 }}>You will be redirected shortly</p>
      </div>
    </div>
  )
}

export default function AuthConfirm() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui', background: '#faf9f7' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🧶</div>
          <p style={{ color: '#999', fontSize: 14 }}>Loading...</p>
        </div>
      </div>
    }>
      <ConfirmInner />
    </Suspense>
  )
}