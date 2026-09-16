import { getCurrentlyPlaying } from '@/api/spotify'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = await getCurrentlyPlaying()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching spotify now playing:', error)
    return NextResponse.json({ error: 'Failed to fetch now playing' }, { status: 500 })
  }
}
