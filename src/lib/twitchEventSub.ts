'use client'

import { useEffect, useRef } from 'react'

export type HypeTrainStage = 'begin' | 'progress' | 'end'

export interface HypeTrainEvent {
  stage: HypeTrainStage
  id: string
  level: number
  progress?: number
  goal?: number
  total?: number
  topContributorName?: string
}

type TwitchEventSubMessage = {
  metadata: {
    message_id: string
    message_type:
      | 'session_welcome'
      | 'session_keepalive'
      | 'session_reconnect'
      | 'notification'
      | 'revocation'
    subscription_type?: string
  }
  payload: {
    session?: {
      id: string
      status: string
      reconnect_url?: string | null
      keepalive_timeout_seconds?: number | null
    }
    subscription?: { type: string; id: string }
    event?: Record<string, unknown>
  }
}

const HYPE_TYPES = [
  'channel.hype_train.begin',
  'channel.hype_train.progress',
  'channel.hype_train.end',
] as const

type HypeType = (typeof HYPE_TYPES)[number]

function parseTopContributor(event: Record<string, unknown>): string | undefined {
  const top = event.top_contributions
  if (Array.isArray(top) && top.length > 0) {
    const entry = top[0] as { user_name?: string }
    return entry?.user_name
  }
  const last = event.last_contribution as { user_name?: string } | undefined
  return last?.user_name
}

function toHypeEvent(type: HypeType, event: Record<string, unknown>): HypeTrainEvent | null {
  const id = (event.id as string) || `hype-${Date.now()}`
  const level = Number(event.level ?? 1)

  if (type === 'channel.hype_train.end') {
    return {
      stage: 'end',
      id,
      level,
      total: Number(event.total ?? 0),
      topContributorName: parseTopContributor(event),
    }
  }

  return {
    stage: type === 'channel.hype_train.begin' ? 'begin' : 'progress',
    id,
    level,
    progress: Number(event.progress ?? 0),
    goal: Number(event.goal ?? 0),
    total: Number(event.total ?? 0),
    topContributorName: parseTopContributor(event),
  }
}

async function createSubscription(
  type: HypeType,
  broadcasterUserId: string,
  sessionId: string,
  clientId: string,
  token: string
): Promise<void> {
  const res = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
    method: 'POST',
    headers: {
      'Client-Id': clientId,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type,
      version: '1',
      condition: { broadcaster_user_id: broadcasterUserId },
      transport: { method: 'websocket', session_id: sessionId },
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(
      `[twitchEventSub] failed to create ${type} subscription (${res.status}): ${text}`
    )
  }
}

export function useTwitchHypeTrain({
  channelId,
  onEvent,
  enabled = true,
}: {
  channelId: string
  onEvent: (event: HypeTrainEvent) => void
  enabled?: boolean
}) {
  const onEventRef = useRef(onEvent)
  onEventRef.current = onEvent

  useEffect(() => {
    if (!enabled) return
    if (typeof window === 'undefined') return

    const clientId = process.env.TWITCH_CLIENT_ID
    const token = process.env.TWITCH_OAUTH_TOKEN
    if (!clientId || !token || !channelId) {
      console.warn(
        '[useTwitchHypeTrain] missing TWITCH_CLIENT_ID / TWITCH_OAUTH_TOKEN / channelId; Hype Train events will not be captured.'
      )
      return
    }

    let socket: WebSocket | null = null
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null
    let closedByCleanup = false

    const connect = (url: string) => {
      socket = new WebSocket(url)

      socket.onmessage = async (event: MessageEvent<string>) => {
        let msg: TwitchEventSubMessage
        try {
          msg = JSON.parse(event.data)
        } catch {
          return
        }

        const { message_type } = msg.metadata

        if (message_type === 'session_welcome') {
          const sessionId = msg.payload.session?.id
          if (!sessionId) return
          try {
            await Promise.all(
              HYPE_TYPES.map(type =>
                createSubscription(type, channelId, sessionId, clientId, token)
              )
            )
          } catch (err) {
            console.error(
              '[useTwitchHypeTrain] subscription failed — token may be missing `channel:read:hype_train` scope:',
              err
            )
          }
          return
        }

        if (message_type === 'session_reconnect') {
          const reconnectUrl = msg.payload.session?.reconnect_url
          if (reconnectUrl) {
            const old = socket
            socket = null
            old?.close()
            connect(reconnectUrl)
          }
          return
        }

        if (message_type === 'notification') {
          const type = msg.payload.subscription?.type as HypeType | undefined
          const ev = msg.payload.event
          if (!type || !ev || !HYPE_TYPES.includes(type)) return
          const hypeEvent = toHypeEvent(type, ev)
          if (hypeEvent) onEventRef.current(hypeEvent)
        }
      }

      socket.onclose = () => {
        if (closedByCleanup) return
        reconnectTimer = setTimeout(() => connect('wss://eventsub.wss.twitch.tv/ws'), 5000)
      }

      socket.onerror = () => {
        socket?.close()
      }
    }

    connect('wss://eventsub.wss.twitch.tv/ws')

    return () => {
      closedByCleanup = true
      if (reconnectTimer) clearTimeout(reconnectTimer)
      socket?.close()
      socket = null
    }
  }, [channelId, enabled])
}
