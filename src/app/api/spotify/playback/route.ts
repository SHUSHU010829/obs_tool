import { getPlaybackState } from '@/api/spotify'
import { IDLE_PLAYBACK_STATE, SpotifyPlaybackState } from '@/lib/nowplaying/types'
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
  let state: SpotifyPlaybackState

  try {
    state = await loadState()
  } catch (error) {
    // getPlaybackState reports failures through `status` rather than throwing,
    // so reaching here means something unexpected broke.
    console.error('Error fetching spotify playback state:', error)
    state = {
      ...IDLE_PLAYBACK_STATE,
      status: 'upstream_error',
      detail: error instanceof Error ? error.message : 'unknown error',
      fetchedAt: Date.now(),
    }
  }

  if (state.status !== 'ok' && state.status !== 'idle') {
    console.error(`Spotify playback unavailable (${state.status}): ${state.detail ?? ''}`)
  }

  // Always HTTP 200: an OBS browser source must never render an error page.
  // The real outcome travels in `status`, which the overlay keeps silent by
  // default and the admin studio surfaces.
  return NextResponse.json(state, { headers: { 'Cache-Control': 'no-store' } })
}
