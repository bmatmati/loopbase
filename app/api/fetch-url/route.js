import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { url } = await request.json()
    if (!url) return NextResponse.json({ error: 'No URL provided' }, { status: 400 })

    let title = '', description = '', image = '', author = ''

    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be')

    if (isYouTube) {
      const videoId = url.match(/(?:v=|youtu\.be\/)([^&\?]+)/)?.[1]
      if (videoId) {
        // Try maxres first, fall back to hqdefault
        const maxres = 'https://img.youtube.com/vi/' + videoId + '/maxresdefault.jpg'
        const hq = 'https://img.youtube.com/vi/' + videoId + '/hqdefault.jpg'
        const checkImg = await fetch(maxres, { method: 'HEAD' })
        image = (checkImg.ok && checkImg.headers.get('content-length') !== '1403') ? maxres : hq
        const ytApiKey = process.env.YOUTUBE_API_KEY
        if (ytApiKey) {
          const ytRes = await fetch(
            'https://www.googleapis.com/youtube/v3/videos?part=snippet&id=' + videoId + '&key=' + ytApiKey
          )
          if (ytRes.ok) {
            const ytData = await ytRes.json()
            const snippet = ytData.items?.[0]?.snippet
            if (snippet) {
              title = snippet.title || ''
              author = snippet.channelTitle || ''
              description = (snippet.description || '').substring(0, 1000)
            }
          }
        } else {
          const oembedUrl = 'https://www.youtube.com/oembed?url=' + encodeURIComponent(url) + '&format=json'
          const res = await fetch(oembedUrl)
          if (res.ok) {
            const data = await res.json()
            title = data.title || ''
            author = data.author_name || ''
          }
        }
      }
    } else {
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
      title = getMeta('og:title') || (titleTag ? titleTag[1].trim() : '')
      description = (getMeta('og:description') || getMeta('description')).substring(0, 300)
      image = getMeta('og:image')
      author = getMeta('og:site_name') || getMeta('author') || ''
    }

    return NextResponse.json({ title, description, image, author, url })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
