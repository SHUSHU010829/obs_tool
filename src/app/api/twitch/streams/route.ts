import { NextResponse } from 'next/server'
import { getStreams } from '@/api/twitch'

export async function GET() {
  try {
    const data = await getStreams()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching streams:', error)
    return NextResponse.json({ error: 'Failed to fetch streams' }, { status: 500 })
  }
}
