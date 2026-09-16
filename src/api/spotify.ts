import axios from 'axios'

const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const PLAYER_URL = 'https://api.spotify.com/v1/me/player?market=from_token'
const NOW_PLAYING_URL =
  'https://api.spotify.com/v1/me/player/currently-playing?market=from_token'
const AUDIO_ANALYSIS_URL = 'https://api.spotify.com/v1/audio-analysis'

/**
 * Normalized playback state. This is the single contract the visual layer
 * consumes — it carries no styling concepts, and nothing downstream of it
 * should ever talk to Spotify directly.
 */
export type SpotifyPlaybackState = {
  /** A device is connected and has a track loaded (playing OR paused). */
  isActive: boolean
  /** true = playing, false = paused. Only meaningful when isActive. */
  isPlaying: boolean
  track: {
    id: string
    title: string
    artists: string[]
    album: string
    artworkUrl: string | null
    durationMs: number
  } | null
  progressMs: number
  /** Server clock at fetch time, so clients can correct interpolation drift. */
  fetchedAt: number
  device: { name: string; type: string } | null
  shuffle: boolean
  repeat: 'off' | 'track' | 'context'
}

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

export const IDLE_PLAYBACK_STATE: SpotifyPlaybackState = {
  isActive: false,
  isPlaying: false,
  track: null,
  progressMs: 0,
  fetchedAt: 0,
  device: null,
  shuffle: false,
  repeat: 'off',
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing Spotify credentials in environment')
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  })

  const res = await axios.post(TOKEN_URL, body.toString(), {
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  const accessToken = res.data?.access_token as string | undefined
  const expiresIn = (res.data?.expires_in as number | undefined) ?? 3600
  if (!accessToken) throw new Error('Spotify token response missing access_token')

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

/**
 * Full playback state, including paused tracks. Prefers /v1/me/player (which
 * also yields device / shuffle / repeat for the HUD's technical readout) and
 * degrades to /currently-playing when that scope is unavailable.
 */
export async function getPlaybackState(): Promise<SpotifyPlaybackState> {
  const token = await getAccessToken()
  const headers = { Authorization: `Bearer ${token}` }
  // 204 = no active device; 403 = missing scope. Both are handled, not thrown.
  const validateStatus = (status: number) =>
    (status >= 200 && status < 300) || status === 204 || status === 403

  if (!playerScopeDenied) {
    const res = await axios.get(PLAYER_URL, { headers, validateStatus })

    if (res.status === 403) {
      playerScopeDenied = true
    } else if (res.status === 204 || !res.data) {
      return { ...IDLE_PLAYBACK_STATE, fetchedAt: Date.now() }
    } else {
      return buildState(res.data, { withDevice: true })
    }
  }

  const res = await axios.get(NOW_PLAYING_URL, { headers, validateStatus })
  if (res.status !== 200 || !res.data) {
    return { ...IDLE_PLAYBACK_STATE, fetchedAt: Date.now() }
  }
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
