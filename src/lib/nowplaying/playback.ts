'use client'

import { IDLE_PLAYBACK_STATE, SpotifyPlaybackState } from './types'
import { useCallback, useEffect, useRef, useState } from 'react'

/** Normal cadence while a track plays. */
const POLL_ACTIVE_MS = 3_000
/** Tightened near the end of a track so track changes land quickly. */
const POLL_ENDGAME_MS = 1_000
/** Relaxed while nothing is playing. */
const POLL_IDLE_MS = 8_000
/** How close to the end counts as "endgame". */
const ENDGAME_WINDOW_MS = 8_000
/** Divergence above this is treated as a seek rather than drift. */
const SEEK_THRESHOLD_MS = 1_500

export type PlaybackSync = {
  state: SpotifyPlaybackState
  /** Interpolated position, smooth between polls. */
  progressMs: number
  /** Changes whenever the track changes — use it as an animation key. */
  trackKey: string
}

/** Synthetic tracks so the HUD can be developed and previewed without Spotify. */
const DEMO_DURATION_MS = 214_000

/** Inline gradient cover, so demo mode exercises real colour extraction. */
function demoArtwork(hue: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="hsl(${hue},85%,55%)"/><stop offset="100%" stop-color="hsl(${hue + 40},70%,28%)"/></linearGradient></defs><rect width="64" height="64" fill="url(#g)"/></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const DEMO_TRACKS = [
  {
    id: 'demo-1',
    title: 'Neon Cascade',
    artists: ['Vector Drift', 'Aiko Mirai'],
    album: 'Parallax Horizon',
    hue: 165,
  },
  {
    id: 'demo-2',
    title: 'Midnight Protocol',
    artists: ['SYNTH//ARC'],
    album: 'Nightfall Systems',
    hue: 288,
  },
  {
    id: 'demo-3',
    title: 'Chromatic Rain',
    artists: ['Hoshino Rei'],
    album: 'Analog Bloom',
    hue: 22,
  },
]

function demoState(elapsedMs: number): SpotifyPlaybackState {
  // Cycle tracks so the preview shows the per-track colour change.
  const index = Math.floor(elapsedMs / DEMO_DURATION_MS) % DEMO_TRACKS.length
  const t = DEMO_TRACKS[index]

  return {
    status: 'ok',
    detail: null,
    isActive: true,
    isPlaying: true,
    track: {
      id: t.id,
      title: t.title,
      artists: t.artists,
      album: t.album,
      artworkUrl: demoArtwork(t.hue),
      durationMs: DEMO_DURATION_MS,
    },
    progressMs: elapsedMs % DEMO_DURATION_MS,
    fetchedAt: Date.now(),
    device: { name: 'HUD Preview', type: 'Computer' },
    shuffle: false,
    repeat: 'off',
  }
}

/**
 * Owns all Spotify polling and progress interpolation. The visual layer only
 * ever sees the normalized state this returns.
 *
 * Interpolation runs off performance.now() deltas rather than assuming a
 * regular interval, so a throttled background tab drifts far less; every poll
 * then snaps the position back to the server's authoritative value.
 */
export function usePlaybackSync(opts: { demo: boolean }): PlaybackSync {
  const { demo } = opts

  const [state, setState] = useState<SpotifyPlaybackState>(IDLE_PLAYBACK_STATE)
  const [progressMs, setProgressMs] = useState(0)

  /** Authoritative anchor: server position plus the local clock reading at arrival. */
  const anchorRef = useRef<{ positionMs: number; at: number }>({ positionMs: 0, at: 0 })
  const stateRef = useRef<SpotifyPlaybackState>(IDLE_PLAYBACK_STATE)
  const demoStartRef = useRef<number>(Date.now())

  const applyState = useCallback((next: SpotifyPlaybackState) => {
    stateRef.current = next
    setState(next)
    anchorRef.current = { positionMs: next.progressMs, at: performance.now() }
    setProgressMs(next.progressMs)
  }, [])

  // Polling loop. A self-scheduling timeout (rather than setInterval) lets the
  // cadence adapt after each response.
  useEffect(() => {
    if (demo) {
      demoStartRef.current = Date.now()
      applyState(demoState(0))
      return
    }

    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined

    const nextDelay = (s: SpotifyPlaybackState): number => {
      if (!s.isActive || !s.isPlaying) return POLL_IDLE_MS
      const remaining = s.track ? s.track.durationMs - s.progressMs : Infinity
      return remaining <= ENDGAME_WINDOW_MS ? POLL_ENDGAME_MS : POLL_ACTIVE_MS
    }

    const poll = async () => {
      try {
        const res = await fetch('/api/spotify/playback', { cache: 'no-store' })
        if (!res.ok) throw new Error('playback fetch failed')
        const data = (await res.json()) as SpotifyPlaybackState
        if (cancelled) return

        const prev = stateRef.current
        const sameTrack = prev.track?.id === data.track?.id
        const interpolated =
          anchorRef.current.positionMs + (performance.now() - anchorRef.current.at)
        const diverged = Math.abs(interpolated - data.progressMs) > SEEK_THRESHOLD_MS

        // Re-anchor on a track change, a play/pause flip, or a seek. Otherwise
        // keep the smooth local position and only refresh the metadata, so
        // sub-threshold jitter between polls never shows up as a stutter.
        if (
          !sameTrack ||
          prev.isPlaying !== data.isPlaying ||
          diverged ||
          !prev.isActive
        ) {
          applyState(data)
        } else {
          stateRef.current = data
          setState(data)
        }
      } catch {
        if (cancelled) return
        // The request itself failed (offline, deploy in progress). That is a
        // different condition from Spotify reporting nothing playing.
        applyState({
          ...IDLE_PLAYBACK_STATE,
          status: 'upstream_error',
          detail: '無法連線到 /api/spotify/playback',
          fetchedAt: Date.now(),
        })
      } finally {
        if (!cancelled) {
          timer = setTimeout(poll, nextDelay(stateRef.current))
        }
      }
    }

    poll()

    // A hidden OBS source or backgrounded tab should re-sync the moment it
    // becomes visible again rather than waiting out the current timer.
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && !cancelled) {
        clearTimeout(timer)
        poll()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelled = true
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [demo, applyState])

  // Interpolation loop, driven by rAF so it stays aligned with rendering.
  useEffect(() => {
    let frame = 0

    const tick = () => {
      frame = requestAnimationFrame(tick)

      if (demo) {
        const next = demoState(Date.now() - demoStartRef.current)
        stateRef.current = next
        setProgressMs(next.progressMs)
        return
      }

      const current = stateRef.current
      if (!current.isActive || !current.isPlaying || !current.track) return

      const elapsed = performance.now() - anchorRef.current.at
      setProgressMs(
        Math.min(anchorRef.current.positionMs + elapsed, current.track.durationMs)
      )
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [demo])

  // Keep the demo track's metadata in state without rebuilding it every frame.
  useEffect(() => {
    if (!demo) return
    const id = setInterval(
      () => setState(demoState(Date.now() - demoStartRef.current)),
      1000
    )
    return () => clearInterval(id)
  }, [demo])

  return {
    state,
    progressMs,
    trackKey: state.track?.id ?? 'idle',
  }
}
