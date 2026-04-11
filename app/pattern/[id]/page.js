import { getPattern } from '../../../lib/server'
import PatternDetailClient from './PatternDetailClient'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://loopbase.uk'

export async function generateMetadata({ params }) {
  const { id } = await params
  const pattern = await getPattern(id)
  if (!pattern) return { title: 'Pattern | Loopbase' }
  return {
    title: pattern.title,
    description: pattern.description || 'Free ' + pattern.difficulty + ' crochet pattern by ' + pattern.author + '. Find more free patterns on Loopbase.',
    openGraph: {
      title: pattern.title + ' - Free Crochet Pattern',
      description: 'Free ' + pattern.difficulty + ' crochet pattern by ' + pattern.author,
      images: pattern.image_url ? [{ url: pattern.image_url }] : [],
      url: siteUrl + '/pattern/' + id,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: pattern.title,
      images: pattern.image_url ? [pattern.image_url] : [],
    },
    alternates: { canonical: siteUrl + '/pattern/' + id },
  }
}

export const dynamicParams = true

export const revalidate = 60

export default async function PatternDetail({ params }) {
  const { id } = await params
  const pattern = await getPattern(id)

  return (
    <>
      {pattern && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: pattern.title,
            description: pattern.description,
            image: pattern.image_url,
            author: { '@type': 'Person', name: pattern.author },
            educationalLevel: pattern.difficulty,
            url: siteUrl + '/pattern/' + id,
          })}}
        />
      )}
      <PatternDetailClient initialPattern={pattern} patternId={id} />
    </>
  )
}
