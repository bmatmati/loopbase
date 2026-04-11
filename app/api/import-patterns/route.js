import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request) {
  try {
    const { patterns } = await request.json()
    if (!patterns || !patterns.length) {
      return NextResponse.json({ error: 'No patterns provided' }, { status: 400 })
    }

    const cleaned = patterns.map(p => ({
      title: String(p.title || '').trim(),
      author: String(p.author || '').trim(),
      difficulty: p.difficulty || 'Beginner',
      time_estimate: p.time_estimate || 'Under 2h',
      category: p.category || 'Accessories',
      format: p.format || 'both',
      tutorial_url: String(p.tutorial_url || '').trim(),
      image_url: String(p.image_url || '').trim(),
      description: String(p.description || '').trim(),
      hook_size: String(p.hook_size || '').trim(),
      yarn_weight: String(p.yarn_weight || '').trim(),
      yarn_type: String(p.yarn_type || '').trim(),
      tags: String(p.tags || '').trim(),
      yarn_affiliate: String(p.yarn_affiliate || '').trim(),
      yarn_name: String(p.yarn_name || '').trim(),
      yarn_price: String(p.yarn_price || '').trim(),
      hook_affiliate: String(p.hook_affiliate || '').trim(),
      hook_name: String(p.hook_name || '').trim(),
      hook_price: String(p.hook_price || '').trim(),
      is_published: p.is_published === 'TRUE' || p.is_published === true || p.is_published === 'true'
    })).filter(p => p.title && p.tutorial_url)

    const { data, error } = await supabase.from('patterns').insert(cleaned).select()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, count: data.length })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
