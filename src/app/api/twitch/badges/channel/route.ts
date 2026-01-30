import { NextRequest, NextResponse } from 'next/server'
import { getChannelBadges } from '@/api/twitch'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const broadcasterId = searchParams.get('broadcaster_id')

  if (!broadcasterId) {
    return NextResponse.json({ error: 'broadcaster_id is required' }, { status: 400 })
  }

  try {
    const data = await getChannelBadges(broadcasterId)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching channel badges:', error)
    return NextResponse.json({ error: 'Failed to fetch channel badges' }, { status: 500 })
  }
}
