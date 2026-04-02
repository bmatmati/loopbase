import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { url } = await request.json()
    if (!url) return NextResponse.json({ error: 'No URL provided' }, { status: 400 })

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Loopbase/1.0)' }
    })

    const html = await res.text()

    function getMeta(prop) {
      const r1 = new RegExp('<meta[^>]+property=["\']' + prop + '["\'][^>]+content=["\']([^"\']+)["\']', 'i')
      const r2 = new RegExp('<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']' + prop + '["\']', 'i')
      const r3 = new RegExp('<meta[^>]+name=["\']' + prop + '["\'][^>]+content=["\']([^"\']+)["\']', 'i')
      const m = html.match(r1) || html.match(r2) || html.match(r3)
      return m ? m[1].trim() : ''
    }

    const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const rawTitle = getMeta('og:title') || (titleTag ? titleTag[1].trim() : '')
    const title = rawTitle.replace(' - YouTube', '').replace(' | YouTube', '').trim()
    const description = (getMeta('og:description') || getMeta('description')).substring(0, 200)
    const image = getMeta('og:image')

    let author = getMeta('og:site_name') || getMeta('author') || ''
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const ch = html.match(/"ownerChannelName":"([^"]+)"/) || html.match(/"author":"([^"]+)"/)
      if (ch) author = ch[1]
    }

    return NextResponse.json({ title, description, image, author, url })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
