import {
  getPlaybackState,
  IDLE_PLAYBACK_STATE,
  SpotifyPlaybackState,
} from '@/api/spotify'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Short-lived server cache. Several overlay sources (plus the admin preview)
 * can poll at ~1s without multiplying our request count against Spotify's
 * rate limit.
 */
const CACHE_TTL_MS = 1_000

let cache: { state: SpotifyPlaybackState; at: number } | null = null
let inFlight: Promise<SpotifyPlaybackState> | null = null

async function loadState(): Promise<SpotifyPlaybackState> {
  const now = Date.now()
  if (cache && now - cache.at < CACHE_TTL_MS) return cache.state
  // Collapse concurrent misses onto a single upstream request.
  if (inFlight) return inFlight

  inFlight = getPlaybackState()
    .then(state => {
      cache = { state, at: Date.now() }
      return state
    })
    .finally(() => {
      inFlight = null
    })

  return inFlight
}

export async function GET() {
  try {
    const state = await loadState()
    return NextResponse.json(state, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Error fetching spotify playback state:', error)
    // Overlays must never render an error frame in OBS — report "idle" instead.
    return NextResponse.json(
      { ...IDLE_PLAYBACK_STATE, fetchedAt: Date.now() },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
