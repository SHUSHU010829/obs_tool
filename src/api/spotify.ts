import axios from 'axios'

const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const NOW_PLAYING_URL = 'https://api.spotify.com/v1/me/player/currently-playing?market=from_token'

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

export async function getCurrentlyPlaying(): Promise<NowPlayingTrack | null> {
  const token = await getAccessToken()

  const res = await axios.get(NOW_PLAYING_URL, {
    headers: { Authorization: `Bearer ${token}` },
    validateStatus: (status: number) => (status >= 200 && status < 300) || status === 204,
  })

  if (res.status === 204 || !res.data) return null

  const item = res.data.item
  const isPlaying = Boolean(res.data.is_playing)
  if (!item || !isPlaying) return null

  const artists: string = Array.isArray(item.artists)
    ? item.artists.map((a: { name: string }) => a.name).filter(Boolean).join(', ')
    : ''

  const albumImage: string | null = item.album?.images?.[0]?.url ?? null

  return {
    trackId: String(item.id ?? `${item.name}-${artists}`),
    name: String(item.name ?? ''),
    artists,
    albumImage,
    progressMs: typeof res.data.progress_ms === 'number' ? res.data.progress_ms : 0,
    durationMs: typeof item.duration_ms === 'number' ? item.duration_ms : 0,
    isPlaying,
  }
}
