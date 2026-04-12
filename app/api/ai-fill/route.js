import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { title, description, url, author } = await request.json()

    const prompt = `You are helping to catalog a free crochet pattern. Based on the information below, fill in the missing details.

Pattern title: ${title}
Author: ${author}
Description: ${description}
URL: ${url}

Please respond with ONLY a JSON object (no markdown, no explanation) with these exact fields:
{
  "description": "2 sentence description of the pattern if not provided",
  "hook_size": "most likely hook size e.g. 4mm, 5mm, 6mm, 8mm",
  "yarn_weight": "most likely yarn weight e.g. DK, Aran, Chunky, Super Chunky, Fingering",
  "yarn_type": "most likely yarn type e.g. Acrylic, Cotton, Wool, Chenille",
  "tags": "5-8 comma separated tags e.g. beginner, quick make, gift idea, summer, amigurumi",
  "difficulty": "Beginner or Intermediate or Advanced",
  "time_estimate": "Under 2h or 2-5h or 5h+",
  "category": "Accessories or Home or Toys or Garments or Baby or Other"
}

Base your answers on the pattern title and description. For example:
- Amigurumi patterns typically use 3-4mm hooks and DK/Sport weight cotton or acrylic
- Blankets typically use 5-8mm hooks and chunky/aran weight yarn
- Garments vary widely but often use DK or Aran weight
- Baby items typically use soft acrylic or cotton`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const data = await response.json()
    const text = data.content?.[0]?.text || '{}'
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    return NextResponse.json(parsed)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
