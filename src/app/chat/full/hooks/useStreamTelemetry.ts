'use client'

import { useEffect, useRef, useState } from 'react'

type StreamTelemetry = {
  loaded: boolean
  isLive: boolean
  currentViewers: number | null
  viewerHistory: number[]
  startedAt: number | null
  uptimeSeconds: number | null
}

const MAX_SAMPLES = 60
const POLL_INTERVAL_MS = 60_000

export function useStreamTelemetry(): StreamTelemetry {
  const [currentViewers, setCurrentViewers] = useState<number | null>(null)
  const [viewerHistory, setViewerHistory] = useState<number[]>([])
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [uptimeSeconds, setUptimeSeconds] = useState<number | null>(null)
  const startedAtRef = useRef<number | null>(null)

  useEffect(() => {
    let cancelled = false

    const poll = async () => {
      try {
        const res = await fetch('/api/twitch/streams')
        if (!res.ok) throw new Error('stream fetch failed')
        const data = await res.json()
        const stream = data?.data?.[0]
        if (cancelled) return

        const viewers = typeof stream?.viewer_count === 'number' ? stream.viewer_count : null
        const started = stream?.started_at ? Date.parse(stream.started_at) : null

        setCurrentViewers(viewers)
        setStartedAt(started)
        startedAtRef.current = started
        setLoaded(true)

        if (viewers !== null) {
          setViewerHistory(prev => {
            const next = [...prev, viewers]
            return next.length > MAX_SAMPLES ? next.slice(-MAX_SAMPLES) : next
          })
        }
      } catch {
        if (cancelled) return
        setCurrentViewers(null)
        setStartedAt(null)
        startedAtRef.current = null
        setLoaded(true)
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
    const tick = () => {
      const s = startedAtRef.current
      setUptimeSeconds(s === null ? null : Math.max(0, Math.floor((Date.now() - s) / 1000)))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return {
    loaded,
    isLive: startedAt !== null,
    currentViewers,
    viewerHistory,
    startedAt,
    uptimeSeconds,
  }
}
