import {
  IDLE_PLAYBACK_STATE,
  PlaybackStatus,
  SpotifyPlaybackState,
} from '@/lib/nowplaying/types'
import axios from 'axios'

// This module holds the OAuth flow and reads the client secret. Importing it
// from a client component would bundle all of that into the browser, so fail
// loudly at import time instead of shipping it silently.
if (typeof window !== 'undefined') {
  throw new Error(
    'src/api/spotify.ts is server-only and must not be imported from client code'
  )
}

export { IDLE_PLAYBACK_STATE }
export type { PlaybackStatus, SpotifyPlaybackState }

const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const PLAYER_URL = 'https://api.spotify.com/v1/me/player?market=from_token'
const NOW_PLAYING_URL =
  'https://api.spotify.com/v1/me/player/currently-playing?market=from_token'
const AUDIO_ANALYSIS_URL = 'https://api.spotify.com/v1/audio-analysis'

/** Legacy shape kept for the existing /chat/full sidebar block. */
export type NowPlayingTrack = {
  trackId: string
  name: string
  artists: string
  albumImage: string | null
  progressMs: number
  durationMs: number
  isPlaying: boolean
}

let cachedToken: { value: string; expiresAt: number } | null = null

/**
 * /v1/me/player needs the user-read-playback-state scope, which an older
 * refresh token may not carry. On the first 403 we latch this and fall back
 * to /currently-playing for the rest of the process lifetime.
 */
let playerScopeDenied = false

/** A failure we can describe to the operator, rather than an opaque throw. */
class SpotifyFailure extends Error {
  constructor(
    readonly status: PlaybackStatus,
    readonly detail: string
  ) {
    super(`${status}: ${detail}`)
  }
}

/** Names the missing vars so the operator knows exactly what to set. */
function missingCredentials(): string[] {
  return (
    ['SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET', 'SPOTIFY_REFRESH_TOKEN'] as const
  ).filter(key => !process.env[key])
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value
  }

  const missing = missingCredentials()
  if (missing.length > 0) {
    throw new SpotifyFailure('unconfigured', missing.join(', '))
  }

  const basic = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString('base64')
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: process.env.SPOTIFY_REFRESH_TOKEN as string,
  })

  const res = await axios.post(TOKEN_URL, body.toString(), {
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    // Read the error body instead of throwing, so `invalid_grant` (a revoked
    // or rotated refresh token) can be reported precisely.
    validateStatus: (status: number) => status < 600,
  })

  if (res.status !== 200) {
    const code = String(res.data?.error ?? `HTTP ${res.status}`)
    throw new SpotifyFailure(
      res.status === 400 || res.status === 401 ? 'auth_failed' : 'upstream_error',
      code
    )
  }

  const accessToken = res.data?.access_token as string | undefined
  const expiresIn = (res.data?.expires_in as number | undefined) ?? 3600
  if (!accessToken) {
    throw new SpotifyFailure('auth_failed', 'token response missing access_token')
  }

  cachedToken = {
    value: accessToken,
    expiresAt: Date.now() + (expiresIn - 60) * 1000,
  }
  return accessToken
}

function normalizeRepeat(value: unknown): SpotifyPlaybackState['repeat'] {
  return value === 'track' || value === 'context' ? value : 'off'
}

/** The subset of Spotify's response shape this module actually reads. */
type SpotifyItem = {
  id?: string
  name?: string
  duration_ms?: number
  artists?: { name?: string }[]
  album?: { name?: string; images?: { url?: string }[] }
}

type SpotifyPlayerResponse = {
  item?: SpotifyItem | null
  is_playing?: boolean
  progress_ms?: number
  device?: { name?: string; type?: string }
  shuffle_state?: boolean
  repeat_state?: string
}

/** Maps a Spotify `item` object onto our normalized track shape. */
function normalizeTrack(item: SpotifyItem | null | undefined) {
  if (!item) return null

  const artists: string[] = Array.isArray(item.artists)
    ? item.artists
        .map((a: { name?: string }) => a?.name)
        .filter((n: string | undefined): n is string => Boolean(n))
    : []

  return {
    id: String(item.id ?? `${item.name ?? 'unknown'}-${artists.join(',')}`),
    title: String(item.name ?? ''),
    artists,
    album: String(item.album?.name ?? ''),
    artworkUrl: item.album?.images?.[0]?.url ?? null,
    durationMs: typeof item.duration_ms === 'number' ? item.duration_ms : 0,
  }
}

function buildState(
  data: SpotifyPlayerResponse,
  opts: { withDevice: boolean }
): SpotifyPlaybackState {
  const track = normalizeTrack(data.item)

  return {
    status: track ? 'ok' : 'idle',
    detail: null,
    isActive: Boolean(track),
    isPlaying: Boolean(data.is_playing),
    track,
    progressMs: typeof data.progress_ms === 'number' ? data.progress_ms : 0,
    fetchedAt: Date.now(),
    device:
      opts.withDevice && data.device?.name
        ? { name: String(data.device.name), type: String(data.device.type ?? '') }
        : null,
    shuffle: opts.withDevice ? Boolean(data.shuffle_state) : false,
    repeat: opts.withDevice ? normalizeRepeat(data.repeat_state) : 'off',
  }
}

/** Every status we expect to handle, so axios never throws on a known case. */
const acceptAllStatuses = (status: number) => status < 600

function failureState(status: PlaybackStatus, detail: string): SpotifyPlaybackState {
  return { ...IDLE_PLAYBACK_STATE, status, detail, fetchedAt: Date.now() }
}

function idleState(): SpotifyPlaybackState {
  return { ...IDLE_PLAYBACK_STATE, status: 'idle', fetchedAt: Date.now() }
}

/** Maps a non-2xx Spotify response onto a described failure. */
function classify(status: number, data: unknown): SpotifyFailure {
  const message =
    typeof data === 'object' && data !== null
      ? ((data as { error?: { message?: string } }).error?.message ?? '')
      : ''

  if (status === 401)
    return new SpotifyFailure('auth_failed', message || 'access token rejected')
  if (status === 403)
    return new SpotifyFailure('auth_failed', message || 'insufficient scope')
  if (status === 429) return new SpotifyFailure('rate_limited', 'too many requests')
  return new SpotifyFailure('upstream_error', message || `HTTP ${status}`)
}

/**
 * Full playback state, including paused tracks. Prefers /v1/me/player (which
 * also yields device / shuffle / repeat for the HUD's technical readout) and
 * degrades to /currently-playing when that scope is unavailable.
 *
 * Never throws: every outcome is reported through `status` so the overlay can
 * stay silent on stream while the operator can still see what went wrong.
 */
export async function getPlaybackState(): Promise<SpotifyPlaybackState> {
  try {
    return await fetchPlaybackState(false)
  } catch (error) {
    if (error instanceof SpotifyFailure) {
      return failureState(error.status, error.detail)
    }
    const detail = error instanceof Error ? error.message : 'unknown error'
    return failureState('upstream_error', detail)
  }
}

async function fetchPlaybackState(isRetry: boolean): Promise<SpotifyPlaybackState> {
  const token = await getAccessToken()
  const headers = { Authorization: `Bearer ${token}` }

  /**
   * A 401 means the cached access token died early (clock skew, revoked
   * session). Drop it and try once more before calling it an auth failure.
   */
  const retryOnce = async (): Promise<SpotifyPlaybackState> => {
    if (isRetry)
      throw new SpotifyFailure('auth_failed', 'access token rejected after refresh')
    cachedToken = null
    return fetchPlaybackState(true)
  }

  if (!playerScopeDenied) {
    const res = await axios.get(PLAYER_URL, {
      headers,
      validateStatus: acceptAllStatuses,
    })

    if (res.status === 401) return retryOnce()
    // 403 here is almost always a refresh token issued without the
    // user-read-playback-state scope, which /currently-playing does not need.
    if (res.status === 403) {
      playerScopeDenied = true
    } else if (res.status === 204) {
      return idleState()
    } else if (res.status === 200 && res.data) {
      return buildState(res.data, { withDevice: true })
    } else if (res.status !== 200) {
      throw classify(res.status, res.data)
    }
  }

  const res = await axios.get(NOW_PLAYING_URL, {
    headers,
    validateStatus: acceptAllStatuses,
  })
  if (res.status === 401) return retryOnce()
  if (res.status === 204) return idleState()
  if (res.status !== 200) throw classify(res.status, res.data)
  if (!res.data) return idleState()

  return buildState(res.data, { withDevice: false })
}

/**
 * Legacy adapter for the /chat/full sidebar. Returns null when nothing is
 * playing, preserving the original behaviour exactly.
 */
export async function getCurrentlyPlaying(): Promise<NowPlayingTrack | null> {
  const state = await getPlaybackState()
  if (!state.track || !state.isPlaying) return null

  return {
    trackId: state.track.id,
    name: state.track.title,
    artists: state.track.artists.join(', '),
    albumImage: state.track.artworkUrl,
    progressMs: state.progressMs,
    durationMs: state.track.durationMs,
    isPlaying: state.isPlaying,
  }
}

/** Compact, client-friendly reduction of Spotify's audio analysis. */
export type ReducedAudioAnalysis = {
  available: true
  /** Normalized 0..1 loudness, evenly sampled across the whole track. */
  loudness: number[]
  tempo: number
  durationMs: number
}

export type AudioAnalysisResult = ReducedAudioAnalysis | { available: false }

/** Number of buckets the raw segment list is downsampled to. */
const ANALYSIS_BUCKETS = 512

/**
 * Spotify deprecated /v1/audio-analysis for apps created after 2024-11-27.
 * Once we see a denial we stop asking for the rest of the process lifetime.
 */
let analysisUnavailable = false

export async function getAudioAnalysis(trackId: string): Promise<AudioAnalysisResult> {
  if (analysisUnavailable) return { available: false }

  const token = await getAccessToken()
  const res = await axios.get(`${AUDIO_ANALYSIS_URL}/${encodeURIComponent(trackId)}`, {
    headers: { Authorization: `Bearer ${token}` },
    validateStatus: (status: number) => status < 500,
  })

  if (res.status === 401 || res.status === 403 || res.status === 404) {
    // 401/403 mean the app lacks access at all, so latch it off. A 404 is
    // per-track (local files, podcasts), so keep trying for other tracks.
    if (res.status !== 404) analysisUnavailable = true
    return { available: false }
  }

  const segments = res.data?.segments
  const durationMs = Math.round((res.data?.track?.duration ?? 0) * 1000)
  if (!Array.isArray(segments) || segments.length === 0 || durationMs <= 0) {
    return { available: false }
  }

  // loudness_max is dBFS, typically about -60..0. Map onto 0..1.
  const buckets = new Array<number>(ANALYSIS_BUCKETS).fill(0)
  const counts = new Array<number>(ANALYSIS_BUCKETS).fill(0)

  for (const seg of segments) {
    const start = typeof seg?.start === 'number' ? seg.start : 0
    const idx = Math.min(
      ANALYSIS_BUCKETS - 1,
      Math.max(0, Math.floor(((start * 1000) / durationMs) * ANALYSIS_BUCKETS))
    )
    const db = typeof seg?.loudness_max === 'number' ? seg.loudness_max : -60
    buckets[idx] += Math.min(1, Math.max(0, (db + 60) / 60))
    counts[idx] += 1
  }

  // Carry the last seen value across empty buckets so the curve stays continuous.
  let last = 0
  const loudness = buckets.map((sum, i) => {
    if (counts[i] === 0) return last
    last = sum / counts[i]
    return last
  })

  return {
    available: true,
    loudness,
    tempo: typeof res.data?.track?.tempo === 'number' ? res.data.track.tempo : 120,
    durationMs,
  }
}
