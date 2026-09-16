import { getAudioAnalysis } from '@/api/spotify'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Best-effort only. Spotify deprecated audio-analysis for apps registered
 * after 2024-11-27, so `{ available: false }` is an entirely normal response
 * and the visualizer stays on its procedural source when it comes back.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ trackId: string }> }
) {
  const { trackId } = await params

  try {
    return NextResponse.json(await getAudioAnalysis(trackId))
  } catch (error) {
    console.error('Error fetching spotify audio analysis:', error)
    return NextResponse.json({ available: false })
  }
}
