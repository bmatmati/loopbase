import { createClient } from '@supabase/supabase-js'

export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

export async function getPatterns({ difficulty, time, format } = {}) {
  const supabase = createServerClient()
  let query = supabase
    .from('patterns')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (difficulty) query = query.eq('difficulty', difficulty)
  if (time) query = query.eq('time_estimate', time)
  if (format) {
    if (format === 'pattern') query = query.in('format', ['pattern', 'both'])
    else if (format === 'video') query = query.in('format', ['video', 'both'])
    else query = query.eq('format', format)
  }

  const { data } = await query
  return data || []
}

export async function getPattern(id) {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('patterns')
    .select('*')
    .eq('id', id)
    .single()
  return data
}
