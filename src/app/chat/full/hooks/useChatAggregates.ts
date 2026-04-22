'use client'

import { ChatMessage } from '@/app/chat/components/type'
import { useCallback, useEffect, useRef, useState } from 'react'

export type TopChatter = {
  user: string
  count: number
  color: string
  lastTs: number
}

type ChatAggregates = {
  topChatters: TopChatter[]
  msgPerMinute: number
  recentEvents: ChatMessage[]
  push: (msg: ChatMessage) => void
}

const EVENTS_BUFFER = 20
const TOP_N = 5
const MINUTE_MS = 60_000
const STORAGE_PREFIX = 'chat-full-topchatters-v1-'
const MAX_KEPT_SESSIONS = 3

function serialize(map: Map<string, TopChatter>): string {
  return JSON.stringify(Array.from(map.entries()))
}

function deserialize(raw: string): Map<string, TopChatter> {
  try {
    const parsed = JSON.parse(raw) as Array<[string, TopChatter]>
    return new Map(parsed)
  } catch {
    return new Map()
  }
}

function cleanupOldSessions(keepSessionId: number) {
  try {
    const sessionIds: number[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(STORAGE_PREFIX)) {
        const id = Number(k.slice(STORAGE_PREFIX.length))
        if (Number.isFinite(id)) sessionIds.push(id)
      }
    }
    const sorted = sessionIds.sort((a, b) => b - a)
    const toDrop = sorted.slice(MAX_KEPT_SESSIONS)
    for (const id of toDrop) {
      if (id !== keepSessionId) localStorage.removeItem(STORAGE_PREFIX + id)
    }
  } catch {
    // ignore
  }
}

function sortTop(map: Map<string, TopChatter>): TopChatter[] {
  return Array.from(map.values())
    .sort((a, b) => b.count - a.count || b.lastTs - a.lastTs)
    .slice(0, TOP_N)
}

export function useChatAggregates(sessionId: number | null): ChatAggregates {
  const [topChatters, setTopChatters] = useState<TopChatter[]>([])
  const [msgPerMinute, setMsgPerMinute] = useState(0)
  const [recentEvents, setRecentEvents] = useState<ChatMessage[]>([])

  const countsRef = useRef<Map<string, TopChatter>>(new Map())
  const windowRef = useRef<number[]>([])
  const activeSessionRef = useRef<number | null>(null)
  const hydratedRef = useRef(false)

  // Hydrate / reset counts when stream session changes.
  useEffect(() => {
    if (sessionId === null) return // offline — keep in-memory counts untouched

    const prev = activeSessionRef.current

    if (!hydratedRef.current) {
      // First-time hydration. Merge any in-flight counts with stored.
      try {
        const raw = localStorage.getItem(STORAGE_PREFIX + sessionId)
        if (raw) {
          const stored = deserialize(raw)
          const inFlight = countsRef.current
          const merged = new Map(stored)
          inFlight.forEach((v, k) => {
            const existing = merged.get(k)
            if (existing) {
              merged.set(k, {
                user: v.user || existing.user,
                color: v.color || existing.color,
                count: existing.count + v.count,
                lastTs: Math.max(existing.lastTs, v.lastTs),
              })
            } else {
              merged.set(k, v)
            }
          })
          countsRef.current = merged
        }
      } catch {
        // ignore
      }
      hydratedRef.current = true
    } else if (prev !== null && prev !== sessionId) {
      // Session changed (new stream). Flush current to its old key, then load new.
      try {
        localStorage.setItem(STORAGE_PREFIX + prev, serialize(countsRef.current))
      } catch {
        // ignore
      }
      countsRef.current = new Map()
      try {
        const raw = localStorage.getItem(STORAGE_PREFIX + sessionId)
        if (raw) countsRef.current = deserialize(raw)
      } catch {
        // ignore
      }
    }

    activeSessionRef.current = sessionId
    setTopChatters(sortTop(countsRef.current))
    cleanupOldSessions(sessionId)
  }, [sessionId])

  const push = useCallback((msg: ChatMessage) => {
    if (msg.type === 'message') {
      const key = msg.user.toLowerCase()
      const existing = countsRef.current.get(key)
      countsRef.current.set(key, {
        user: msg.user,
        count: (existing?.count ?? 0) + 1,
        color: msg.color || existing?.color || '#00FF87',
        lastTs: msg.timestamp,
      })

      setTopChatters(sortTop(countsRef.current))
      windowRef.current.push(msg.timestamp)

      const sid = activeSessionRef.current
      if (sid !== null) {
        try {
          localStorage.setItem(STORAGE_PREFIX + sid, serialize(countsRef.current))
        } catch {
          // ignore quota errors
        }
      }
    } else {
      setRecentEvents(prev => {
        const next = [msg, ...prev]
        return next.length > EVENTS_BUFFER ? next.slice(0, EVENTS_BUFFER) : next
      })
    }
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      const cutoff = Date.now() - MINUTE_MS
      windowRef.current = windowRef.current.filter(t => t >= cutoff)
      setMsgPerMinute(windowRef.current.length)
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return { topChatters, msgPerMinute, recentEvents, push }
}
