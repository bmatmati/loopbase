'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ExitPage({ params }) {
  const router = useRouter()
  const { id } = params

  const [pattern, setPattern] = useState(null)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('patterns')
        .select('*')
        .eq('id', id)
        .single()

      if (!error) setPattern(data)
    }
    load()
  }, [id])

  if (!pattern) return <div>Loading…</div>

  return (
    <div style={{ padding: 20 }}>
      <h1>Before you go…</h1>

      <p>Here are the yarns and tools used in this pattern:</p>

      {pattern.yarn_affiliate_url && (
        <a href={pattern.yarn_affiliate_url} target="_blank">
          Recommended Yarn
        </a>
      )}

      {pattern.hook_affiliate_url && (
        <a href={pattern.hook_affiliate_url} target="_blank">
          Crochet Hook
        </a>
      )}

      <button
        onClick={() => router.push(pattern.tutorial_url)}
        style={{ marginTop: 20 }}
      >
        Continue to tutorial →
      </button>
    </div>
  )
}