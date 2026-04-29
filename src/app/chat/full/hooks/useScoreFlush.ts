'use client'

import { useEffect, useRef } from 'react'
import type { TopChatter } from './useChatAggregates'

const FLUSHED_STORAGE_KEY = 'chat-full-flushed-sessions-v1'
const COUNTS_STORAGE_PREFIX = 'chat-full-topchatters-v1-'
const FLUSH_ENDPOINT = '/api/discord/flush-chat-score'
const OFFLINE_CONFIRM_THRESHOLD = 2
const MAX_FLUSHED_TRACKED = 20

type ScorePayloadEntry = {
  twitchLogin: string
  twitchDisplayName: string
  count: number
}

type FlushPayload = {
  sessionId: number
  channel: string
  channelId: string
  startedAt: string
  endedAt: string
  scores: ScorePayloadEntry[]
}

type UseScoreFlushArgs = {
  channel: string
  channelId: string
  sessionId: number | null
  getScores: () => TopChatter[]
}

function loadFlushedSet(): Set<number> {
  try {
    const raw = localStorage.getItem(FLUSHED_STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return new Set()
    const ids = parsed.filter((v): v is number => typeof v === 'number' && Number.isFinite(v))
    return new Set(ids)
  } catch {
    return new Set()
  }
}

function persistFlushedSet(set: Set<number>) {
  try {
    const arr = Array.from(set).sort((a, b) => b - a).slice(0, MAX_FLUSHED_TRACKED)
    localStorage.setItem(FLUSHED_STORAGE_KEY, JSON.stringify(arr))
  } catch {
    // ignore quota / private mode
  }
}

function buildScores(chatters: TopChatter[]): ScorePayloadEntry[] {
  return chatters
    .filter(c => c.count > 0)
    .sort((a, b) => b.count - a.count || b.lastTs - a.lastTs)
    .map(c => ({
      twitchLogin: (c.login || c.displayName || '').toLowerCase(),
      twitchDisplayName: c.displayName || c.user || c.login,
      count: c.count,
    }))
}

async function postFlush(payload: FlushPayload): Promise<boolean> {
  try {
    const res = await fetch(FLUSH_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      console.warn('[useScoreFlush] flush failed', res.status)
      return false
    }
    return true
  } catch (err) {
    console.warn('[useScoreFlush] flush error', err)
    return false
  }
}

function readStoredSession(sessionId: number): TopChatter[] {
  try {
    const raw = localStorage.getItem(COUNTS_STORAGE_PREFIX + sessionId)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Array<[string, Partial<TopChatter> & { user?: string }]>
    if (!Array.isArray(parsed)) return []
    return parsed.map(([key, value]) => {
      const displayName = value.displayName ?? value.user ?? key
      const login = value.login ?? key
      return {
        login,
        displayName,
        user: displayName,
        count: typeof value.count === 'number' ? value.count : 0,
        color: value.color ?? '#00FF87',
        lastTs: typeof value.lastTs === 'number' ? value.lastTs : 0,
      }
    })
  } catch {
    return []
  }
}

function listStoredSessionIds(): number[] {
  try {
    const ids: number[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(COUNTS_STORAGE_PREFIX)) {
        const id = Number(k.slice(COUNTS_STORAGE_PREFIX.length))
        if (Number.isFinite(id)) ids.push(id)
      }
    }
    return ids
  } catch {
    return []
  }
}

export function useScoreFlush({
  channel,
  channelId,
  sessionId,
  getScores,
}: UseScoreFlushArgs) {
  const prevSessionIdRef = useRef<number | null>(null)
  const offlineCountRef = useRef(0)
  const flushingRef = useRef(false)

  // Detect end-of-stream and flush.
  useEffect(() => {
    if (sessionId !== null) {
      prevSessionIdRef.current = sessionId
      offlineCountRef.current = 0
      return
    }

    const prev = prevSessionIdRef.current
    if (prev === null) return

    offlineCountRef.current += 1
    if (offlineCountRef.current < OFFLINE_CONFIRM_THRESHOLD) return
    if (flushingRef.current) return

    const flushed = loadFlushedSet()
    if (flushed.has(prev)) {
      prevSessionIdRef.current = null
      offlineCountRef.current = 0
      return
    }

    const scores = buildScores(getScores())
    if (scores.length === 0) {
      // Nothing to send; mark as flushed so we don't keep retrying.
      flushed.add(prev)
      persistFlushedSet(flushed)
      prevSessionIdRef.current = null
      offlineCountRef.current = 0
      return
    }

    const payload: FlushPayload = {
      sessionId: prev,
      channel,
      channelId,
      startedAt: new Date(prev).toISOString(),
      endedAt: new Date().toISOString(),
      scores,
    }

    flushingRef.current = true
    postFlush(payload)
      .then(ok => {
        if (ok) {
          const set = loadFlushedSet()
          set.add(prev)
          persistFlushedSet(set)
          prevSessionIdRef.current = null
          offlineCountRef.current = 0
        }
      })
      .finally(() => {
        flushingRef.current = false
      })
  }, [sessionId, channel, channelId, getScores])

  // Backfill on mount: send any stored sessions that were never flushed.
  useEffect(() => {
    let cancelled = false

    const run = async () => {
      const flushed = loadFlushedSet()
      const ids = listStoredSessionIds()
      const activeSessionId = prevSessionIdRef.current

      for (const id of ids) {
        if (cancelled) return
        if (flushed.has(id)) continue
        if (activeSessionId !== null && id === activeSessionId) continue

        const stored = readStoredSession(id)
        const scores = buildScores(stored)
        if (scores.length === 0) {
          flushed.add(id)
          persistFlushedSet(flushed)
          continue
        }

        const lastTs = stored.reduce(
          (acc, c) => (c.lastTs > acc ? c.lastTs : acc),
          0
        )
        const payload: FlushPayload = {
          sessionId: id,
          channel,
          channelId,
          startedAt: new Date(id).toISOString(),
          endedAt: new Date(lastTs > 0 ? lastTs : Date.now()).toISOString(),
          scores,
        }

        const ok = await postFlush(payload)
        if (cancelled) return
        if (ok) {
          flushed.add(id)
          persistFlushedSet(flushed)
        }
      }
    }

    run()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
