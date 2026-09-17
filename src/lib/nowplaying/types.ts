/**
 * Client-safe playback types.
 *
 * These live apart from `src/api/spotify.ts` on purpose: that module holds the
 * OAuth flow and must never be pulled into the browser bundle. Client code
 * importing a runtime value (not just a type) from it would drag the whole
 * server module along, so anything the client needs at runtime belongs here.
 */

/**
 * Why there is (or isn't) playback data. The overlay stays silent for all of
 * these by default, so this is what makes an outage distinguishable from
 * "nothing is playing" without putting an error frame on stream.
 */
export type PlaybackStatus =
  | 'ok' // playing or paused
  | 'idle' // connected fine, nothing loaded
  | 'unconfigured' // SPOTIFY_* env vars missing
  | 'auth_failed' // refresh token rejected / credentials wrong
  | 'rate_limited' // 429 from Spotify
  | 'upstream_error' // any other Spotify failure

/** Normalized playback state — the single contract the visual layer consumes. */
export type SpotifyPlaybackState = {
  status: PlaybackStatus
  /** Short, non-sensitive explanation. Never contains credentials. */
  detail: string | null
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

export const IDLE_PLAYBACK_STATE: SpotifyPlaybackState = {
  status: 'idle',
  detail: null,
  isActive: false,
  isPlaying: false,
  track: null,
  progressMs: 0,
  fetchedAt: 0,
  device: null,
  shuffle: false,
  repeat: 'off',
}

/** True when the status means something is wrong, rather than merely idle. */
export function isFailureStatus(status: PlaybackStatus): boolean {
  return status !== 'ok' && status !== 'idle'
}

/** Human-readable status line, used by the admin studio and `?debug=1`. */
export function describeStatus(state: SpotifyPlaybackState): string {
  switch (state.status) {
    case 'ok':
      return state.track
        ? `連線正常 — ${state.isPlaying ? '正在播放' : '已暫停'}《${state.track.title}》`
        : '連線正常'
    case 'idle':
      return '連線正常，目前沒有在播放'
    case 'unconfigured':
      return `環境變數未設定${state.detail ? `：${state.detail}` : ''}`
    case 'auth_failed':
      return `憑證驗證失敗${state.detail ? `（${state.detail}）` : ''} — 需要重新產生 refresh token`
    case 'rate_limited':
      return 'Spotify 速率限制，稍後會自動恢復'
    case 'upstream_error':
      return `Spotify 回應異常${state.detail ? `：${state.detail}` : ''}`
  }
}
