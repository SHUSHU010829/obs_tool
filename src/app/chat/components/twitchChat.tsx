'use client'

import TwitchChatDebug from './debug'
import { EmoteCache } from './emoteCache'
import MessageFragment from './messageFragment'
import { eventMotionProps, subPlanModifier } from './eventMotion'
import { BadgeSet, BadgeVersion, ChatMessage, ParsedEmote, SevenTVEmote } from './type'
import { getChannelBadges, getGlobalBadges } from '@/api/twitchClient'
import { useTwitchHypeTrain, type HypeTrainEvent } from '@/lib/twitchEventSub'
import { motion, AnimatePresence } from 'framer-motion'
import React, { useEffect, useState, memo, useCallback, useRef } from 'react'
import tmi from 'tmi.js'

async function fetch7TVEmotes(channelId: string): Promise<SevenTVEmote[]> {
  try {
    const response = await fetch(`https://7tv.io/v3/users/twitch/${channelId}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data.emote_set?.emotes || []
  } catch (error) {
    console.error('Error fetching 7TV emotes:', error)
    return []
  }
}

const formatMessageFragments = (
  fragments: { type: 'text' | 'emote'; content: string; provider?: string }[]
) => {
  const lines: { type: 'text' | 'emote'; content: string; provider?: string }[][] = [[]]
  let buffer: { type: 'text' | 'emote'; content: string; provider?: string }[] = []

  const pushBufferToLine = () => {
    if (buffer.length > 0) {
      lines[lines.length - 1].push(...buffer)
      buffer = []
    }
  }

  fragments.forEach(fragment => {
    if (fragment.type === 'emote') {
      pushBufferToLine()
      lines[lines.length - 1].push(fragment)
    } else {
      buffer.push(fragment)
    }
  })

  pushBufferToLine()
  return lines
}

const MessageContent = memo(
  ({
    fragments,
    messageId,
  }: {
    fragments: {
      type: 'text' | 'emote'
      content: string
      provider?: string
    }[]
    messageId: string
  }) => {
    const formattedLines = formatMessageFragments(fragments)

    return (
      <>
        {formattedLines.map((line, lineIndex) => (
          <div
            key={`${messageId}-line-${lineIndex}`}
            className='flex flex-wrap items-center'
          >
            {line.map((fragment, index) => (
              <MessageFragment
                key={`${messageId}-fragment-${lineIndex}-${index}`}
                fragment={fragment}
                messageId={messageId}
                index={index}
              />
            ))}
          </div>
        ))}
      </>
    )
  }
)

MessageContent.displayName = 'MessageContent'

// Render multiple text badges from raw tags.badges
function renderBadges(badges: Record<string, string | undefined>) {
  const items: React.ReactNode[] = []

  if (badges.broadcaster)
    items.push(<span key='bc' className='chat-badge badge-broadcaster font-spaceMono'>實況主</span>)
  if (badges.moderator)
    items.push(<span key='mod' className='chat-badge badge-mod font-spaceMono'>MOD</span>)
  if (badges.vip)
    items.push(<span key='vip' className='chat-badge badge-vip font-spaceMono'>VIP</span>)

  const subVal = badges.subscriber ?? badges.founder
  if (subVal !== undefined) {
    items.push(<span key='sub' className='chat-badge badge-sub font-spaceMono'>Sub</span>)
    if (subVal === '2000')
      items.push(<span key='t2' className='chat-badge badge-sub-tier font-spaceMono'>T2</span>)
    if (subVal === '3000')
      items.push(<span key='t3' className='chat-badge badge-sub-tier font-spaceMono'>T3</span>)
  }

  return items
}

// Regular chat message component
const ChatMessageComponent = memo(({ msg }: { msg: ChatMessage }) => {
  const isMention = msg.message.includes('@')
  const isFirst = msg.isFirstMessage

  const containerClass = [
    'chat-msg',
    isMention && 'chat-msg--mention',
    isFirst && 'chat-msg--first',
  ]
    .filter(Boolean)
    .join(' ')

  const time = new Date(msg.timestamp)
  const timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`

  const usernameColor = msg.color || '#00FF87'

  return (
    <div className={containerClass}>
      {isFirst && (
        <div className='first-chat-label font-spaceMono' style={{ marginBottom: 2 }}>FIRST CHAT</div>
      )}

      <div className='msg-meta'>
        {renderBadges(msg.badges)}
        <span className='msg-username font-spaceMono' style={{ color: usernameColor }}>
          {msg.user}
        </span>
        <span className='msg-colon'>:</span>
        <span className='msg-ts font-spaceMono'>{timeStr}</span>
      </div>

      <div className='msg-text font-notoSans'>
        <MessageContent fragments={msg.messageFragments} messageId={msg.id} />
      </div>
    </div>
  )
})

ChatMessageComponent.displayName = 'ChatMessageComponent'

// Sub plan display helper
function subPlanLabel(plan?: string): string {
  if (plan === '2000') return 'Tier 2'
  if (plan === '3000') return 'Tier 3'
  if (plan === 'Prime') return 'Prime'
  return 'Tier 1'
}

// Community-gift size → visual tier (50+ = legendary)
function giftsubTier(count: number): { modifier: string; caption: string } {
  if (count >= 50) return { modifier: 'giftsub--legendary', caption: '★  LEGENDARY GIFT  ★' }
  if (count >= 25) return { modifier: 'giftsub--epic',      caption: '✧  EPIC GIFT  ✧' }
  if (count >= 10) return { modifier: 'giftsub--rare',      caption: '✦  GENEROUS GIFT  ✦' }
  if (count >= 5)  return { modifier: 'giftsub--uncommon',  caption: '✦  COMMUNITY GIFT  ✦' }
  return { modifier: '',                                    caption: '✦  COMMUNITY GIFT  ✦' }
}

// Event card component for special events
export const EventCardComponent = memo(({ msg }: { msg: ChatMessage }) => {
  const typeConfig: Record<string, { cardClass: string; tagIcon: string; label: string }> = {
    subscription: { cardClass: 'event-card--sub',    tagIcon: 'S', label: 'New Subscriber' },
    resub:        { cardClass: 'event-card--resub',  tagIcon: 'R', label: 'Resub' },
    giftsub:      { cardClass: 'event-card--giftsub', tagIcon: 'G', label: 'Community Gift' },
    cheer:        { cardClass: 'event-card--cheer',  tagIcon: 'B', label: 'Cheer' },
    raid:         { cardClass: 'event-card--raid',   tagIcon: '!', label: 'Incoming Raid' },
    hype_train:   { cardClass: 'event-card--hype',   tagIcon: 'HT', label: 'Hype Train' },
  }

  const config = typeConfig[msg.type] || typeConfig.subscription
  const tier = subPlanLabel(msg.subPlan)
  const isNewSub = msg.type === 'subscription'
  const giftMeta = msg.type === 'giftsub'
    ? giftsubTier(msg.giftCount ?? 1)
    : null

  const isTieredSub = msg.type === 'subscription' || msg.type === 'resub'
  const tierModifier = isTieredSub ? ` event-card--${subPlanModifier(msg.subPlan)}` : ''
  const hypeStageModifier =
    msg.type === 'hype_train' && msg.hypeStage ? ` event-card--hype-${msg.hypeStage}` : ''

  return (
    <div
      data-tier={isTieredSub ? subPlanModifier(msg.subPlan) : undefined}
      className={`event-card ${config.cardClass}${isNewSub ? ' event-card--new-sub' : ''}${giftMeta && giftMeta.modifier ? ' ' + giftMeta.modifier : ''}${tierModifier}${hypeStageModifier}`}
    >
      {/* Type tag row */}
      <div className='event-type-tag'>
        <span className='tag-icon'>{config.tagIcon}</span>
        <span className='tag-label'>{config.label}</span>

        {/* Right-side badge per type */}
        {(msg.type === 'subscription' || msg.type === 'resub') && (
          <span className='sub-tier-tag'>{tier}</span>
        )}
        {msg.type === 'cheer' && msg.bits != null && (
          <span className='bits-amount-block'>
            <span className='bits-big-num'>{msg.bits}</span>
            <span className='bits-unit'>bits</span>
          </span>
        )}
      </div>

      {/* Event body */}
      <div className='event-body'>
        {msg.type === 'raid' ? (
          <div className='raid-body'>
            <div className='raid-caption font-spaceMono'>»»  INCOMING RAID  »»</div>
            <div className='raid-username font-spaceMono'>{msg.raidFrom || msg.user}</div>
            <div className='raid-count-row'>
              <span className='raid-big-num font-spaceMono'>{msg.raidViewers ?? 0}</span>
              <span className='raid-num-label font-spaceMono'>RAIDERS 大駕光臨</span>
            </div>
          </div>
        ) : msg.type === 'subscription' ? (
          <div className='new-sub-body'>
            <div className='new-sub-sparkle font-spaceMono'>✦  NEW SUBSCRIBER  ✦</div>
            <div className='new-sub-username font-spaceMono'>{msg.user}</div>
            <div className='new-sub-detail'>
              {msg.subGifter ? `由 ${msg.subGifter} 贈送訂閱` : '首次加入訂閱！'}
            </div>
          </div>
        ) : msg.type === 'resub' ? (
          <div className='resub-line'>
            <span className='resub-username font-spaceMono'>{msg.user}</span>
            <span className='resub-detail'>
              {msg.subMonths != null && msg.subMonths > 0
                ? ` 訂閱第 ${msg.subMonths} 月了`
                : ' 訂閱了頻道'}
            </span>
          </div>
        ) : msg.type === 'giftsub' ? (
          <div className='giftsub-body'>
            <div className='giftsub-caption font-spaceMono'>{giftMeta?.caption}</div>
            <div className='giftsub-count font-spaceMono'>
              <span className='giftsub-count-num'>×{msg.giftCount ?? 1}</span>
              <span className='giftsub-count-unit'>{tier}</span>
            </div>
            <div className='giftsub-gifter'>
              <span className='giftsub-gifter-name font-spaceMono'>{msg.user}</span>
              <span className='giftsub-gifter-text'> 贈送訂閱給社群！</span>
            </div>
          </div>
        ) : msg.type === 'hype_train' ? (
          <div className='hype-body'>
            {msg.hypeStage === 'end' ? (
              <>
                <div className='hype-caption font-spaceMono'>★  HYPE TRAIN END  ★</div>
                <div className='hype-level font-spaceMono'>
                  <span className='hype-level-label'>FINAL LEVEL</span>
                  <span className='hype-level-num'>{msg.hypeLevel ?? 1}</span>
                </div>
              </>
            ) : (
              <>
                <div className='hype-caption font-spaceMono'>
                  {msg.hypeStage === 'begin' ? '»»  HYPE TRAIN START  »»' : '»»  HYPE TRAIN  »»'}
                </div>
                <div className='hype-level font-spaceMono'>
                  <span className='hype-level-label'>LEVEL</span>
                  <span className='hype-level-num'>{msg.hypeLevel ?? 1}</span>
                </div>
                {msg.hypeGoal != null && msg.hypeGoal > 0 && (
                  <div className='hype-progress-row'>
                    <div className='hype-progress-bar'>
                      <div
                        className='hype-progress-fill'
                        style={{
                          width: `${Math.min(100, Math.round(((msg.hypeProgress ?? 0) / msg.hypeGoal) * 100))}%`,
                        }}
                      />
                    </div>
                    <span className='hype-progress-text font-spaceMono'>
                      {msg.hypeProgress ?? 0} / {msg.hypeGoal}
                    </span>
                  </div>
                )}
                {msg.hypeTopContributorName && (
                  <div className='hype-top font-spaceMono'>
                    TOP  ·  {msg.hypeTopContributorName}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          // cheer
          <span className='event-username'>{msg.user}</span>
        )}
      </div>

      {/* Message quote */}
      {msg.message && msg.messageFragments.length > 0 && (
        <div className='event-msg-quote font-notoSans'>
          <MessageContent fragments={msg.messageFragments} messageId={msg.id} />
        </div>
      )}
    </div>
  )
})

EventCardComponent.displayName = 'EventCardComponent'

export default function TwitchChat({
  channel,
  channelId,
  hideAfter = 999,
  messagesLimit = 200,
  debug = false,
  onMessage,
}: {
  channel: string
  channelId: string
  hideAfter?: number
  messagesLimit?: number
  debug?: boolean
  onMessage?: (msg: ChatMessage) => void
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sevenTVEmotes, setSevenTVEmotes] = useState<SevenTVEmote[]>([])
  const sevenTVEmoteCache = useRef<Map<string, string>>(new Map())
  const clientRef = useRef<tmi.Client | null>(null)
  const processedMessageIds = useRef(new Set<string>())

  const onMessageRef = useRef(onMessage)
  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  const appendMessage = useCallback(
    (msg: ChatMessage) => {
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== msg.id)
        const updated = [...filtered, msg]
        return updated.length > messagesLimit ? updated.slice(-messagesLimit) : updated
      })
      onMessageRef.current?.(msg)
    },
    [messagesLimit]
  )

  // Badge cache refs - loaded once on mount
  const channelBadgesCache = useRef<BadgeSet[]>([])
  const globalBadgesCache = useRef<BadgeSet[]>([])
  const badgesCacheLoaded = useRef(false)

  // Load 7TV emotes and badges on mount
  useEffect(() => {
    let isSubscribed = true
    const emoteCache = EmoteCache.getInstance()

    async function loadSevenTVEmotes() {
      try {
        const emotes = await fetch7TVEmotes(channelId)
        if (!isSubscribed) return

        const preloadPromises = emotes.map(emote =>
          emoteCache
            .preloadEmote(emote.id, '7tv')
            .catch(error => console.warn(`Failed to preload emote ${emote.name}:`, error))
        )

        await Promise.all(preloadPromises)

        emotes.forEach(emote => {
          sevenTVEmoteCache.current.set(emote.name, emote.id)
        })

        setSevenTVEmotes(emotes)
      } catch (error) {
        console.error('Failed to load 7TV emotes:', error)
      }
    }

    async function loadBadges() {
      try {
        const [channelRes, globalRes] = await Promise.all([
          getChannelBadges(channelId),
          getGlobalBadges(),
        ])
        channelBadgesCache.current = channelRes.data
        globalBadgesCache.current = globalRes.data
        badgesCacheLoaded.current = true
      } catch (error) {
        console.error('Failed to load badges:', error)
      }
    }

    loadSevenTVEmotes()
    loadBadges()

    return () => {
      isSubscribed = false
    }
  }, [channelId])

  const getUserRole = useCallback((badges: Record<string, string | undefined>) => {
    if (badges.broadcaster) return 'broadcaster'
    if (badges.moderator) return 'mod'
    if (badges.vip) return 'vip'
    if (badges.subscriber || badges.founder) return 'subscriber'
    return 'noRole'
  }, [])

  // Resolve badges from cache instead of API
  const resolveBadges = useCallback((tags: any): BadgeSet[] | undefined => {
    const badges = tags.badges || {}
    const badgeEntries = Object.entries(badges)
    if (badgeEntries.length === 0) return undefined

    const badgeImages: BadgeVersion[] = []

    badgeEntries.forEach(([setId, versionId]) => {
      let badgeVersion: BadgeVersion | undefined

      // Check channel badges first
      const channelBadgeSet = channelBadgesCache.current.find(b => b.set_id === setId)
      if (channelBadgeSet) {
        badgeVersion = channelBadgeSet.versions.find(v => v.id === versionId)
      }

      // Fallback to global badges
      if (!badgeVersion) {
        const globalBadgeSet = globalBadgesCache.current.find(b => b.set_id === setId)
        if (globalBadgeSet) {
          badgeVersion = globalBadgeSet.versions.find(v => v.id === versionId)
        }
      }

      if (badgeVersion) {
        badgeImages.push(badgeVersion)
      }
    })

    if (badgeImages.length === 0) return undefined

    return [{ set_id: 'user-badges', versions: badgeImages }]
  }, [])

  const parseMessageWithEmotes = useCallback(
    (message: string, emotes: Record<string, string[]> | null | undefined) => {
      const fragments: { type: 'text' | 'emote'; content: string; provider?: string }[] =
        []
      const parsedEmotes: ParsedEmote[] = []
      const processedRanges = new Set<string>()

      if (!emotes && (!sevenTVEmotes || sevenTVEmotes.length === 0)) {
        return {
          parsedEmotes: [],
          messageFragments: [{ type: 'text' as const, content: message }],
        }
      }

      const emotePositions: Array<{ start: number; end: number; emote: ParsedEmote }> = []

      // Twitch emotes
      if (emotes) {
        Object.entries(emotes).forEach(([id, positions]) => {
          positions.forEach(position => {
            const [start, end] = position.split('-').map(Number)
            const rangeKey = `${start}-${end}`

            if (!processedRanges.has(rangeKey)) {
              processedRanges.add(rangeKey)
              emotePositions.push({
                start,
                end: end + 1,
                emote: {
                  id,
                  name: message.slice(start, end + 1),
                  imageUrl: `https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/light/2.0`,
                  start,
                  end: end + 1,
                  provider: 'twitch',
                },
              })
            }
          })
        })
      }

      // 7TV emotes
      const words = message.split(/\s+/)
      let currentPosition = 0

      words.forEach(word => {
        const emoteId = sevenTVEmoteCache.current.get(word)
        if (emoteId) {
          const start = message.indexOf(word, currentPosition)
          if (start !== -1) {
            const end = start + word.length
            const rangeKey = `${start}-${end}`

            if (!processedRanges.has(rangeKey)) {
              processedRanges.add(rangeKey)
              emotePositions.push({
                start,
                end,
                emote: {
                  id: emoteId,
                  name: word,
                  imageUrl: emoteId,
                  start,
                  end,
                  provider: '7tv',
                },
              })
            }
          }
        }
        currentPosition += word.length + 1
      })

      emotePositions.sort((a, b) => a.start - b.start)

      let lastIndex = 0
      emotePositions.forEach(({ start, end, emote }) => {
        if (start > lastIndex) {
          fragments.push({
            type: 'text',
            content: message.slice(lastIndex, start),
          })
        }
        fragments.push({
          type: 'emote',
          content: emote.id,
          provider: emote.provider,
        })
        parsedEmotes.push(emote)
        lastIndex = end
      })

      if (lastIndex < message.length) {
        fragments.push({
          type: 'text',
          content: message.slice(lastIndex),
        })
      }

      return {
        parsedEmotes,
        messageFragments: fragments,
      }
    },
    [sevenTVEmotes]
  )

  useEffect(() => {
    if (clientRef.current) {
      clientRef.current.disconnect()
    }

    const client = new tmi.Client({
      channels: [channel],
    })

    clientRef.current = client

    // Single unified message handler (merged handleMessage + handleTwitchMessage)
    const handleChatMessage = async (channel: string, tags: any, message: string) => {
      if (tags.id && processedMessageIds.current.has(tags.id)) {
        return
      }

      const displayName = (tags['display-name'] || tags.username || '').toLowerCase()
      if (displayName === 'streamelements') return

      const role = getUserRole(tags.badges || {})
      const { parsedEmotes, messageFragments } = parseMessageWithEmotes(
        message,
        tags.emotes
      )
      const messageId = tags.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`

      if (tags.id) {
        processedMessageIds.current.add(tags.id)
      }

      // Use cached badges instead of API calls
      const channelBadges = resolveBadges(tags)

      const newMessage: ChatMessage = {
        type: 'message',
        user: tags['display-name'] || 'anonymous',
        userLogin: tags.username ? String(tags.username).toLowerCase() : undefined,
        message,
        badges: tags.badges || {},
        emotes: tags.emotes,
        parsedEmotes,
        messageFragments,
        isSubscriber: !!tags.subscriber,
        isMod: !!tags.mod,
        id: messageId,
        role,
        timestamp: Date.now(),
        channelBadges,
        isFirstMessage: tags['first-msg'] === true || tags['first-msg'] === '1',
        color: tags.color || undefined,
      }

      appendMessage(newMessage)
    }

    const handleSub = (
      channel: string,
      username: string,
      methods: any,
      message: string,
      userState: any
    ) => {
      const newMessage: ChatMessage = {
        type: 'subscription',
        user: username,
        userLogin: (userState.username || username || '').toLowerCase() || undefined,
        message,
        badges: userState.badges || {},
        emotes: userState.emotes,
        parsedEmotes: [],
        messageFragments: message
          ? parseMessageWithEmotes(message, userState.emotes).messageFragments
          : [],
        isSubscriber: true,
        isMod: !!userState.mod,
        id: userState.id || `${Date.now()}-${Math.random()}`,
        role: 'subscriber',
        timestamp: Date.now(),
        subPlan: methods.plan,
        subMonths: methods.months,
      }

      appendMessage(newMessage)
    }

    const handleResub = (
      channel: string,
      username: string,
      months: number,
      message: string,
      userState: any,
      methods: any
    ) => {
      const newMessage: ChatMessage = {
        type: 'resub',
        user: username,
        userLogin: (userState.username || username || '').toLowerCase() || undefined,
        message: message || '',
        badges: userState.badges || {},
        emotes: userState.emotes,
        parsedEmotes: [],
        messageFragments: message
          ? parseMessageWithEmotes(message, userState.emotes).messageFragments
          : [],
        isSubscriber: true,
        isMod: !!userState.mod,
        id: userState.id || `${Date.now()}-${Math.random()}`,
        role: 'subscriber',
        timestamp: Date.now(),
        subPlan: methods?.plan,
        subMonths: months,
      }

      appendMessage(newMessage)
    }

    const handleCheer = (channel: string, userState: any, message: string) => {
      const newMessage: ChatMessage = {
        type: 'cheer',
        user: userState['display-name'] || 'anonymous',
        userLogin: userState.username ? String(userState.username).toLowerCase() : undefined,
        message,
        badges: userState.badges || {},
        emotes: userState.emotes,
        parsedEmotes: [],
        messageFragments: parseMessageWithEmotes(message, userState.emotes)
          .messageFragments,
        isSubscriber: !!userState.subscriber,
        isMod: !!userState.mod,
        id: userState.id || `${Date.now()}-${Math.random()}`,
        role: getUserRole(userState.badges || {}),
        timestamp: Date.now(),
        bits: userState.bits,
      }

      appendMessage(newMessage)
    }

    // Individual gift-recipient events are intentionally suppressed:
    // the Community Gift summary (submysterygift → handleMysteryGift) already
    // conveys the gifter's contribution, and per-recipient cards flood the feed.
    const handleGiftSub = () => {
      return
    }

    const handleMysteryGift = (
      channel: string,
      username: string,
      giftCount: number,
      methods: any,
      userState: any
    ) => {
      const newMessage: ChatMessage = {
        type: 'giftsub',
        user: username,
        userLogin: (userState.username || username || '').toLowerCase() || undefined,
        message: '',
        badges: userState.badges || {},
        emotes: null,
        parsedEmotes: [],
        messageFragments: [],
        isSubscriber: true,
        isMod: false,
        id: userState.id || `${Date.now()}-${Math.random()}`,
        role: getUserRole(userState.badges || {}),
        timestamp: Date.now(),
        giftCount,
        subPlan: methods?.plan,
      }

      appendMessage(newMessage)
    }

    const handleRaid = (channel: string, username: string, viewers: number) => {
      const newMessage: ChatMessage = {
        type: 'raid',
        user: username,
        userLogin: username ? username.toLowerCase() : undefined,
        message: '',
        badges: {},
        emotes: null,
        parsedEmotes: [],
        messageFragments: [],
        isSubscriber: false,
        isMod: false,
        id: `raid-${Date.now()}-${Math.random()}`,
        role: 'noRole',
        timestamp: Date.now(),
        raidFrom: username,
        raidViewers: viewers,
      }

      appendMessage(newMessage)
    }

    client.on('message', handleChatMessage)
    client.on('subscription', handleSub)
    client.on('resub', handleResub)
    client.on('cheer', handleCheer)
    client.on('subgift', handleGiftSub)
    client.on('submysterygift', handleMysteryGift)
    client.on('raided', handleRaid)

    client.connect().catch(console.error)

    return () => {
      if (clientRef.current) {
        clientRef.current.removeListener('message', handleChatMessage)
        clientRef.current.removeListener('subscription', handleSub)
        clientRef.current.removeListener('resub', handleResub)
        clientRef.current.removeListener('cheer', handleCheer)
        clientRef.current.removeListener('subgift', handleGiftSub)
        clientRef.current.removeListener('submysterygift', handleMysteryGift)
        clientRef.current.removeListener('raided', handleRaid)
        clientRef.current.disconnect()
        clientRef.current = null
      }
      processedMessageIds.current.clear()
    }
  }, [channel, messagesLimit, getUserRole, parseMessageWithEmotes, resolveBadges, appendMessage])

  useEffect(() => {
    if (hideAfter !== Infinity) {
      const interval = setInterval(() => {
        const now = Date.now()
        setMessages(prev => prev.filter(msg => now - msg.timestamp < hideAfter * 1000))
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [hideAfter])

  const handleHypeEvent = useCallback(
    (ev: HypeTrainEvent) => {
      const newMessage: ChatMessage = {
        type: 'hype_train',
        user: ev.topContributorName || 'Hype Train',
        message: '',
        badges: {},
        emotes: null,
        parsedEmotes: [],
        messageFragments: [],
        isSubscriber: false,
        isMod: false,
        id: `hype-${ev.id}`,
        role: 'noRole',
        timestamp: Date.now(),
        hypeLevel: ev.level,
        hypeProgress: ev.progress,
        hypeGoal: ev.goal,
        hypeStage: ev.stage,
        hypeTopContributorName: ev.topContributorName,
        hypeTotal: ev.total,
      }
      appendMessage(newMessage)
    },
    [appendMessage]
  )

  useTwitchHypeTrain({ channelId, onEvent: handleHypeEvent })

  // Test handlers
  const handleTestMessage = useCallback(
    (username: string, message: string) => {
      const { parsedEmotes, messageFragments } = parseMessageWithEmotes(message, null)
      const newMessage: ChatMessage = {
        type: 'message',
        user: username,
        userLogin: username ? username.toLowerCase() : undefined,
        message,
        badges: { subscriber: '0' },
        emotes: null,
        parsedEmotes,
        messageFragments,
        isSubscriber: true,
        isMod: false,
        id: `test-${Date.now()}`,
        role: 'subscriber',
        timestamp: Date.now(),
      }
      appendMessage(newMessage)
    },
    [parseMessageWithEmotes, appendMessage]
  )

  const handleTestSub = useCallback(
    (username: string, months: number, message: string, tier: '1000' | '2000' | '3000' = '1000') => {
      const newMessage: ChatMessage = {
        type: 'subscription',
        user: username,
        userLogin: username ? username.toLowerCase() : undefined,
        message,
        badges: { subscriber: '0' },
        emotes: null,
        parsedEmotes: [],
        messageFragments: message
          ? parseMessageWithEmotes(message, null).messageFragments
          : [],
        isSubscriber: true,
        isMod: false,
        id: `test-sub-${Date.now()}`,
        role: 'subscriber',
        timestamp: Date.now(),
        subPlan: tier,
        subMonths: months,
      }
      appendMessage(newMessage)
    },
    [parseMessageWithEmotes, appendMessage]
  )

  const handleTestResub = useCallback(
    (username: string, months: number, message: string, tier: '1000' | '2000' | '3000' = '1000') => {
      const newMessage: ChatMessage = {
        type: 'resub',
        user: username,
        userLogin: username ? username.toLowerCase() : undefined,
        message,
        badges: { subscriber: '0' },
        emotes: null,
        parsedEmotes: [],
        messageFragments: message
          ? parseMessageWithEmotes(message, null).messageFragments
          : [],
        isSubscriber: true,
        isMod: false,
        id: `test-resub-${Date.now()}`,
        role: 'subscriber',
        timestamp: Date.now(),
        subPlan: tier,
        subMonths: months,
      }
      appendMessage(newMessage)
    },
    [parseMessageWithEmotes, appendMessage]
  )

  const handleTestHypeTrain = useCallback(
    (stage: 'begin' | 'progress' | 'end', level: number) => {
      const newMessage: ChatMessage = {
        type: 'hype_train',
        user: 'Hype Train',
        message: '',
        badges: {},
        emotes: null,
        parsedEmotes: [],
        messageFragments: [],
        isSubscriber: false,
        isMod: false,
        id: 'test-hype-current',
        role: 'noRole',
        timestamp: Date.now(),
        hypeLevel: level,
        hypeProgress: stage === 'end' ? undefined : 3200 + level * 400,
        hypeGoal: stage === 'end' ? undefined : 5000 + level * 500,
        hypeStage: stage,
        hypeTopContributorName: 'TopFan',
        hypeTotal: level * 12000,
      }
      appendMessage(newMessage)
    },
    [appendMessage]
  )

  const handleTestCheer = useCallback(
    (username: string, bits: number, message: string) => {
      const newMessage: ChatMessage = {
        type: 'cheer',
        user: username,
        userLogin: username ? username.toLowerCase() : undefined,
        message,
        badges: { bits: '1000' },
        emotes: null,
        parsedEmotes: [],
        messageFragments: parseMessageWithEmotes(message, null).messageFragments,
        isSubscriber: true,
        isMod: false,
        id: `test-cheer-${Date.now()}`,
        role: 'subscriber',
        timestamp: Date.now(),
        bits,
      }
      appendMessage(newMessage)
    },
    [parseMessageWithEmotes, appendMessage]
  )

  const handleTestGiftSub = useCallback(
    (gifter: string, count: number) => {
      const newMessage: ChatMessage = {
        type: 'giftsub',
        user: gifter,
        userLogin: gifter ? gifter.toLowerCase() : undefined,
        message: '',
        badges: { subscriber: '0' },
        emotes: null,
        parsedEmotes: [],
        messageFragments: [],
        isSubscriber: true,
        isMod: false,
        id: `test-giftsub-${Date.now()}`,
        role: 'subscriber',
        timestamp: Date.now(),
        giftCount: count,
        subPlan: '1000',
      }
      appendMessage(newMessage)
    },
    [appendMessage]
  )

  const handleTestRaid = useCallback(
    (username: string, viewers: number) => {
      const newMessage: ChatMessage = {
        type: 'raid',
        user: username,
        userLogin: username ? username.toLowerCase() : undefined,
        message: '',
        badges: {},
        emotes: null,
        parsedEmotes: [],
        messageFragments: [],
        isSubscriber: false,
        isMod: false,
        id: `test-raid-${Date.now()}`,
        role: 'noRole',
        timestamp: Date.now(),
        raidFrom: username,
        raidViewers: viewers,
      }
      appendMessage(newMessage)
    },
    [appendMessage]
  )

  const handleTestFirstMessage = useCallback(
    (username: string, message: string) => {
      const { parsedEmotes, messageFragments } = parseMessageWithEmotes(message, null)
      const newMessage: ChatMessage = {
        type: 'message',
        user: username,
        userLogin: username ? username.toLowerCase() : undefined,
        message,
        badges: {},
        emotes: null,
        parsedEmotes,
        messageFragments,
        isSubscriber: false,
        isMod: false,
        id: `test-first-${Date.now()}`,
        role: 'noRole',
        timestamp: Date.now(),
        isFirstMessage: true,
      }
      appendMessage(newMessage)
    },
    [parseMessageWithEmotes, appendMessage]
  )

  return (
    <>
      <div className='relative h-full w-full overflow-hidden'>
        <div className='absolute bottom-0 left-0 right-0 flex flex-col gap-2 px-2 pb-4'>
          <AnimatePresence initial={false} mode='popLayout'>
            {messages.map(msg => {
              const motionProps = eventMotionProps(msg)
              return (
                <motion.div
                  key={msg.id}
                  layout
                  initial={motionProps.initial}
                  animate={motionProps.animate}
                  exit={motionProps.exit}
                  transition={{
                    ...motionProps.transition,
                    layout: { duration: 0.2, ease: 'easeOut' },
                  }}
                  className='w-full'
                  style={{ willChange: 'transform, opacity' }}
                >
                  {msg.type === 'message' ? (
                    <ChatMessageComponent msg={msg} />
                  ) : (
                    <EventCardComponent msg={msg} />
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
      {debug && (
        <TwitchChatDebug
          onSendMessage={handleTestMessage}
          onSimulateSub={handleTestSub}
          onSimulateResub={handleTestResub}
          onSimulateCheer={handleTestCheer}
          onSimulateGiftSub={handleTestGiftSub}
          onSimulateRaid={handleTestRaid}
          onSimulateFirstMessage={handleTestFirstMessage}
          onSimulateHypeTrain={handleTestHypeTrain}
        />
      )}
    </>
  )
}
