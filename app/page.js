import { getPatterns } from '../lib/server'
import HomeClient from './HomeClient'

export const revalidate = 3600

export default async function Home({ searchParams }) {
  const params = await searchParams
  const difficulty = params?.difficulty || null
  const time = params?.time || null
  const format = params?.format || null

  const patterns = await getPatterns({ difficulty, time, format })

  return <HomeClient initialPatterns={patterns} difficulty={difficulty} time={time} format={format} />
}
