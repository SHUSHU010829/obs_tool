'use client'

import type { NowPlayingTrack } from '@/api/spotify'
import { useEffect, useRef, useState } from 'react'

const POLL_INTERVAL_MS = 10_000
const TICK_INTERVAL_MS = 1_000

export function useSpotifyNowPlaying(): { track: NowPlayingTrack | null } {
  const [track, setTrack] = useState<NowPlayingTrack | null>(null)
  const lastFetchAtRef = useRef<number>(0)

  useEffect(() => {
    let cancelled = false

    const poll = async () => {
      try {
        const res = await fetch('/api/spotify/now-playing', { cache: 'no-store' })
        if (!res.ok) throw new Error('spotify fetch failed')
        const data = (await res.json()) as NowPlayingTrack | null
        if (cancelled) return
        lastFetchAtRef.current = Date.now()
        setTrack(data)
      } catch (error) {
        if (cancelled) return
        // Was silent, which made an expired refresh token indistinguishable
        // from "nothing is playing" — both just emptied the sidebar block.
        console.warn('[spotify] now-playing fetch failed:', error)
        setTrack(null)
      }
    }

    poll()
    const id = setInterval(poll, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setTrack(prev => {
        if (!prev || !prev.isPlaying) return prev
        const next = Math.min(prev.progressMs + TICK_INTERVAL_MS, prev.durationMs)
        if (next === prev.progressMs) return prev
        return { ...prev, progressMs: next }
      })
    }, TICK_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  return { track }
}
