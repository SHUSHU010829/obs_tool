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

export function useChatAggregates(): ChatAggregates {
  const [topChatters, setTopChatters] = useState<TopChatter[]>([])
  const [msgPerMinute, setMsgPerMinute] = useState(0)
  const [recentEvents, setRecentEvents] = useState<ChatMessage[]>([])

  const countsRef = useRef<Map<string, TopChatter>>(new Map())
  const windowRef = useRef<number[]>([])

  const push = useCallback((msg: ChatMessage) => {
    if (msg.type === 'message') {
      const key = msg.user.toLowerCase()
      const existing = countsRef.current.get(key)
      const next: TopChatter = {
        user: msg.user,
        count: (existing?.count ?? 0) + 1,
        color: msg.color || existing?.color || '#00FF87',
        lastTs: msg.timestamp,
      }
      countsRef.current.set(key, next)

      const sorted = Array.from(countsRef.current.values())
        .sort((a, b) => (b.count - a.count) || (b.lastTs - a.lastTs))
        .slice(0, TOP_N)
      setTopChatters(sorted)

      windowRef.current.push(msg.timestamp)
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
