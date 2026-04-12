import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { title, description, url, author, products } = await request.json()

    const yarnProducts = (products || []).filter(p => p.type === 'yarn')
    const hookProducts = (products || []).filter(p => p.type === 'hook')

    const yarnLibrary = yarnProducts.length > 0
      ? `\nYarn affiliate library (pick the best match):\n${yarnProducts.map(p =>
          `- ${p.name} | Weight: ${p.yarn_weight || '?'} | Type: ${p.yarn_type || '?'} | Price: ${p.price || '?'} | URL: ${p.affiliate_url}`
        ).join('\n')}`
      : '\nNo yarn products in affiliate library yet.'

    const hookLibrary = hookProducts.length > 0
      ? `\nHook affiliate library (pick the best match):\n${hookProducts.map(p =>
          `- ${p.name} | Size: ${p.hook_size || '?'} | Price: ${p.price || '?'} | URL: ${p.affiliate_url}`
        ).join('\n')}`
      : '\nNo hook products in affiliate library yet.'

    const prompt = `You are helping to catalog a free crochet pattern. Based on the information below, fill in the missing details AND pick the best matching yarn and hook from the affiliate libraries provided.

Pattern title: ${title}
Author: ${author}
Description: ${description}
URL: ${url}
${yarnLibrary}
${hookLibrary}

Please respond with ONLY a JSON object (no markdown, no explanation) with these exact fields:
{
  "description": "2 sentence description of the pattern if not provided",
  "hook_size": "most likely hook size e.g. 4mm, 5mm, 6mm, 8mm",
  "yarn_weight": "most likely yarn weight e.g. DK, Aran, Chunky, Super Chunky, Fingering",
  "yarn_type": "most likely yarn type e.g. Acrylic, Cotton, Wool, Chenille",
  "tags": "5-8 comma separated tags e.g. beginner, quick make, gift idea, summer, amigurumi",
  "difficulty": "Beginner or Intermediate or Advanced",
  "time_estimate": "Under 2h or 2-5h or 5h+",
  "category": "Accessories or Home or Toys or Garments or Baby or Other",
  "yarn_affiliate": "the affiliate_url of the best matching yarn from the library, or empty string if none match",
  "yarn_name": "the name of the best matching yarn from the library, or your best guess if library is empty",
  "yarn_price": "the price of the best matching yarn from the library, or empty string if none match",
  "yarn_image_url": "the image_url of the best matching yarn from the library, or empty string if none match",
  "hook_affiliate": "the affiliate_url of the best matching hook from the library, or empty string if none match",
  "hook_name": "the name of the best matching hook from the library, or your best guess if library is empty",
  "hook_price": "the price of the best matching hook from the library, or empty string if none match",
  "hook_image_url": "the image_url of the best matching hook from the library, or empty string if none match"
}

Matching rules:
- For yarn: match based on yarn_weight and yarn_type. e.g. an amigurumi pattern needs DK/Sport cotton, a basket needs T-shirt yarn, a blanket needs Chunky/Aran
- For hooks: match based on hook_size. e.g. if the pattern needs a 5mm hook, pick the hook that covers 5mm
- If nothing in the library matches well, return empty string for affiliate fields but still fill in the text fields with your best guess`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Anthropic API error:', data)
      return NextResponse.json({ error: data.error?.message || 'Anthropic API error' }, { status: 500 })
    }

    const text = data.content?.[0]?.text || '{}'
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('ai-fill error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
