import { NextResponse } from 'next/server'
import { getGlobalBadges } from '@/api/twitch'

export async function GET() {
  try {
    const data = await getGlobalBadges()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching global badges:', error)
    return NextResponse.json({ error: 'Failed to fetch global badges' }, { status: 500 })
  }
}
