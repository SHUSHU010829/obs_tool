'use client'

import TwitchChatDebug from './debug'
import { EmoteCache } from './emoteCache'
import MessageFragment from './messageFragment'
import { BadgeSet, BadgeVersion, ChatMessage, ParsedEmote, SevenTVEmote } from './type'
import { getChannelBadges, getGlobalBadges } from '@/api/twitch'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, memo, useCallback, useRef } from 'react'
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

  pushBufferToLine() // 處理剩餘的 buffer
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

// 聊天室本身樣式
const ChatMessageComponent = memo(({ msg }: { msg: ChatMessage }) => {
  const renderBadges = () => {
    if (!msg.channelBadges || msg.channelBadges.length === 0) return null

    return (
      <div className='flex items-center space-x-1'>
        {msg.channelBadges.map((badgeSet, badgeIndex) =>
          badgeSet.versions.map((version, versionIndex) => (
            <img
              key={`badge-${badgeSet.set_id}-${version.id}-${badgeIndex}-${versionIndex}`}
              src={version.image_url_2x || version.image_url_1x}
              alt={version.title}
              title={version.title}
              className='h-4 w-4'
              loading='lazy'
            />
          ))
        )}
      </div>
    )
  }

  return (
    <div className='w-full flex flex-col space-y-1'>
      <div className='w-fit relative flex flex-col items-start'>
        {/* 徽章與人名 */}
        <div
          className='glass-tag flex items-center space-x-2 rounded-full py-1 px-3 z-10 relative w-auto max-w-max'
          style={{
            transform: 'rotate(-3deg)',
            transformOrigin: 'left',
            bottom: '-4px',
          }}
        >
          {renderBadges()}
          <span className='font-extrabold text-sm font-notoSans text-slate-800'>{msg.user}</span>
        </div>

        {/* 訊息內容 */}
        <div className='flex items-center translate-x-[-8px]'>
          <div className='w-3 overflow-hidden translate-x-[3px] -translate-y-1'>
            <div
              className='h-2.5 rotate-45 transform origin-bottom-right rounded-sm'
              style={{
                background: 'rgba(255, 255, 255, 0.75)',
              }}
            ></div>
          </div>
          <div className='glass-bubble relative text-slate-900 font-medium font-notoSans rounded-2xl py-2 px-3 z-0 flex items-center w-auto max-w-[280px] ml-1'>
            <MessageContent fragments={msg.messageFragments} messageId={msg.id} />
          </div>
        </div>
      </div>
    </div>
  )
})

ChatMessageComponent.displayName = 'ChatMessageComponent'

export default function TwitchChat({
  channel,
  channelId,
  hideAfter = 999,
  messagesLimit = 200,
  debug = false,
}: {
  channel: string
  channelId: string
  hideAfter?: number
  messagesLimit?: number
  debug?: boolean
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sevenTVEmotes, setSevenTVEmotes] = useState<SevenTVEmote[]>([])
  const sevenTVEmoteCache = useRef<Map<string, string>>(new Map())
  const clientRef = useRef<tmi.Client | null>(null)
  const processedMessageIds = useRef(new Set<string>())

  const chatContainerRef = useRef<HTMLDivElement | null>(null)

  // 自動滾動到底部（使用 requestAnimationFrame 確保平滑）
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      requestAnimationFrame(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: 'smooth',
          })
        }
      })
    }
  }

  useEffect(() => {
    scrollToBottom() // 新訊息加入時滾動到底部
  }, [messages])

  useEffect(() => {
    let isSubscribed = true
    const emoteCache = EmoteCache.getInstance()

    async function loadSevenTVEmotes() {
      try {
        const emotes = await fetch7TVEmotes(channelId)
        if (!isSubscribed) return

        // 預先載入所有表情
        const preloadPromises = emotes.map(emote =>
          emoteCache
            .preloadEmote(emote.id, '7tv')
            .catch(error => console.warn(`Failed to preload emote ${emote.name}:`, error))
        )

        await Promise.all(preloadPromises)

        // 更新快取
        emotes.forEach(emote => {
          sevenTVEmoteCache.current.set(emote.name, emote.id)
        })

        setSevenTVEmotes(emotes)
      } catch (error) {
        console.error('Failed to load 7TV emotes:', error)
      }
    }

    loadSevenTVEmotes()

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

      // 處理 Twitch 表情符號
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

      // 處理 7TV 表情符號
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
    // 確保只創建一個 client 實例
    if (clientRef.current) {
      clientRef.current.disconnect()
    }

    const client = new tmi.Client({
      channels: [channel],
    })

    clientRef.current = client

    const handleMessage = async (channel: string, tags: any, message: string) => {
      if (tags.id && processedMessageIds.current.has(tags.id)) {
        return
      }

      const role = getUserRole(tags.badges || {})

      const { parsedEmotes, messageFragments } = parseMessageWithEmotes(
        message,
        tags.emotes
      )

      const messageId = tags.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`

      if (tags.id) {
        processedMessageIds.current.add(tags.id)
      }

      // **即時請求使用者的 Channel Badges**
      let userChannelBadges: BadgeSet[] = []
      let globalBadges: BadgeSet[] = []
      try {
        const userBadgesResponse = await getChannelBadges(tags['room-id'])
        userChannelBadges = userBadgesResponse.data
      } catch (error) {
        console.error('Failed to fetch user channel badges:', error)
      }

      try {
        const globalBadgesResponse = await getGlobalBadges()
        globalBadges = globalBadgesResponse.data
      } catch (error) {
        console.error('Failed to fetch user global badges:', error)
      }

      // **解析徽章**
      const badgeImages: BadgeVersion[] = []

      Object.entries(tags.badges || {}).forEach(([setId, versionId]) => {
        let badgeVersion: BadgeVersion | undefined

        // **先從 Channel Badges 查找**
        const channelBadgeSet = userChannelBadges.find(b => b.set_id === setId)
        if (channelBadgeSet) {
          badgeVersion = channelBadgeSet.versions.find(v => v.id === versionId)
        }

        // **如果 Channel Badges 沒有對應的徽章，再從 Global Badges 查找**
        if (!badgeVersion) {
          const globalBadgeSet = globalBadges.find(b => b.set_id === setId)
          if (globalBadgeSet) {
            badgeVersion = globalBadgeSet.versions.find(v => v.id === versionId)
          }
        }

        // **如果找到徽章，才加入 badgeImages**
        if (badgeVersion) {
          badgeImages.push(badgeVersion)
        }
      })

      // **合併 Channel 和 Global Badges**
      const combinedBadges: BadgeSet[] = []
      if (badgeImages.length > 0) {
        combinedBadges.push({
          set_id: 'user-badges',
          versions: badgeImages,
        })
      }

      const newMessage: ChatMessage = {
        user: tags['display-name'] || 'anonymous',
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
        channelBadges: combinedBadges.length > 0 ? combinedBadges : undefined,
        type: 'subscription',
      }

      setMessages(prev => {
        const updated = [...prev, newMessage]

        // **確保訊息最多只有 7 則**
        return updated.length > 7 ? updated.slice(-7) : updated
      })
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

      setMessages(prev => [...prev, newMessage].slice(-messagesLimit))
    }

    const handleCheer = (channel: string, userState: any, message: string) => {
      const newMessage: ChatMessage = {
        type: 'cheer',
        user: userState['display-name'] || 'anonymous',
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

      setMessages(prev => [...prev, newMessage].slice(-messagesLimit))
    }

    const handleGiftSub = (
      channel: string,
      username: string,
      streakMonths: number,
      recipient: string,
      methods: any,
      userState: any
    ) => {
      const newMessage: ChatMessage = {
        type: 'subscription',
        user: recipient,
        message: '',
        badges: userState.badges || {},
        emotes: null,
        parsedEmotes: [],
        messageFragments: [],
        isSubscriber: true,
        isMod: false,
        id: userState.id || `${Date.now()}-${Math.random()}`,
        role: 'subscriber',
        timestamp: Date.now(),
        subPlan: methods.plan,
        subMonths: 1,
        subGifter: username,
      }

      setMessages(prev => [...prev, newMessage].slice(-messagesLimit))
    }

    client.on('subscription', handleSub)
    client.on('cheer', handleCheer)
    client.on('subgift', handleGiftSub)

    client.on('message', handleMessage)
    client.connect().catch(console.error)

    return () => {
      if (clientRef.current) {
        clientRef.current.removeListener('message', handleMessage)
        client.removeListener('subscription', handleSub)
        client.removeListener('cheer', handleCheer)
        client.removeListener('subgift', handleGiftSub)
        clientRef.current.disconnect()
        clientRef.current = null
      }
      processedMessageIds.current.clear()
    }
  }, [channel, messagesLimit, getUserRole, parseMessageWithEmotes])

  useEffect(() => {
    if (hideAfter !== Infinity) {
      const interval = setInterval(() => {
        const now = Date.now()
        setMessages(prev => prev.filter(msg => now - msg.timestamp < hideAfter * 1000))
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [hideAfter])

  const handleTwitchMessage = useCallback(
    async (channel: string, tags: any, message: string) => {
      if (tags.id && processedMessageIds.current.has(tags.id)) {
        return
      }

      const role = getUserRole(tags.badges || {})
      const { parsedEmotes, messageFragments } = parseMessageWithEmotes(
        message,
        tags.emotes
      )
      const messageId = tags.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`

      if (tags.id) {
        processedMessageIds.current.add(tags.id)
      }

      // 獲取徽章
      let userChannelBadges: BadgeSet[] = []
      let globalBadges: BadgeSet[] = []
      try {
        const userBadgesResponse = await getChannelBadges(tags['room-id'])
        userChannelBadges = userBadgesResponse.data
      } catch (error) {
        console.error('Failed to fetch user channel badges:', error)
      }

      try {
        const globalBadgesResponse = await getGlobalBadges()
        globalBadges = globalBadgesResponse.data
      } catch (error) {
        console.error('Failed to fetch user global badges:', error)
      }

      const badgeImages: BadgeVersion[] = []
      Object.entries(tags.badges || {}).forEach(([setId, versionId]) => {
        let badgeVersion: BadgeVersion | undefined
        const channelBadgeSet = userChannelBadges.find(b => b.set_id === setId)
        if (channelBadgeSet) {
          badgeVersion = channelBadgeSet.versions.find(v => v.id === versionId)
        }
        if (!badgeVersion) {
          const globalBadgeSet = globalBadges.find(b => b.set_id === setId)
          if (globalBadgeSet) {
            badgeVersion = globalBadgeSet.versions.find(v => v.id === versionId)
          }
        }
        if (badgeVersion) {
          badgeImages.push(badgeVersion)
        }
      })

      const combinedBadges: BadgeSet[] = []
      if (badgeImages.length > 0) {
        combinedBadges.push({
          set_id: 'user-badges',
          versions: badgeImages,
        })
      }

      const newMessage: ChatMessage = {
        type: 'message',
        user: tags['display-name'] || 'anonymous',
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
        channelBadges: combinedBadges.length > 0 ? combinedBadges : undefined,
      }

      setMessages(prev => {
        const updated = [...prev, newMessage]
        return updated.length > messagesLimit ? updated.slice(-messagesLimit) : updated
      })
    },
    [messagesLimit, getUserRole, parseMessageWithEmotes]
  )

  // 測試用的處理函數
  const handleTestMessage = useCallback(
    (message: string) => {
      const mockTags = {
        'display-name': 'TestUser',
        badges: { subscriber: '0' },
        emotes: null,
        id: `test-${Date.now()}`,
        mod: false,
        subscriber: true,
        'room-id': channelId,
      }

      handleTwitchMessage(channel, mockTags, message)
    },
    [channel, channelId, handleTwitchMessage]
  )

  const handleTestSub = useCallback(
    (username: string, months: number, message: string) => {
      const mockMethods = {
        plan: '1000',
        months: months,
      }

      const mockUserState = {
        badges: { subscriber: '0' },
        'display-name': username,
        id: `test-sub-${Date.now()}`,
        mod: false,
        subscriber: true,
      }

      const newMessage: ChatMessage = {
        type: 'subscription',
        user: username,
        message,
        badges: mockUserState.badges || {},
        emotes: null,
        parsedEmotes: [],
        messageFragments: message
          ? parseMessageWithEmotes(message, null).messageFragments
          : [],
        isSubscriber: true,
        isMod: false,
        id: mockUserState.id,
        role: 'subscriber',
        timestamp: Date.now(),
        subPlan: mockMethods.plan as any,
        subMonths: months,
      }

      setMessages(prev => [...prev, newMessage].slice(-messagesLimit))
    },
    [messagesLimit, parseMessageWithEmotes]
  )

  const handleTestCheer = useCallback(
    (username: string, bits: number, message: string) => {
      const mockUserState = {
        bits,
        badges: { bits: '1000' },
        'display-name': username,
        id: `test-cheer-${Date.now()}`,
        mod: false,
        subscriber: true,
      }

      const newMessage: ChatMessage = {
        type: 'cheer',
        user: username,
        message,
        badges: mockUserState.badges || {},
        emotes: null,
        parsedEmotes: [],
        messageFragments: parseMessageWithEmotes(message, null).messageFragments,
        isSubscriber: true,
        isMod: false,
        id: mockUserState.id,
        role: 'subscriber',
        timestamp: Date.now(),
        bits,
      }

      setMessages(prev => [...prev, newMessage].slice(-messagesLimit))
    },
    [messagesLimit, parseMessageWithEmotes]
  )

  const handleTestGiftSub = useCallback(
    (gifter: string, recipient: string) => {
      const mockMethods = {
        plan: '1000',
        months: 1,
      }

      const mockUserState = {
        badges: { subscriber: '0' },
        'display-name': gifter,
        id: `test-giftSub-${Date.now()}`,
        mod: false,
        subscriber: true,
      }

      const newMessage: ChatMessage = {
        type: 'subscription',
        user: recipient,
        message: '',
        badges: mockUserState.badges || {},
        emotes: null,
        parsedEmotes: [],
        messageFragments: [],
        isSubscriber: true,
        isMod: false,
        id: mockUserState.id,
        role: 'subscriber',
        timestamp: Date.now(),
        subPlan: mockMethods.plan as any,
        subMonths: 1,
        subGifter: gifter,
      }

      setMessages(prev => [...prev, newMessage].slice(-messagesLimit))
    },
    [messagesLimit]
  )

  return (
    <div className='h-full w-full'>
      <div className='relative h-full w-full'>
        <div
          className='flex flex-col space-y-3 overflow-y-auto h-full scrollbar-hide px-2 py-1'
          ref={chatContainerRef}
          style={{ scrollBehavior: 'smooth' }}
        >
          <AnimatePresence initial={false} mode='popLayout'>
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                layout
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.15,
                  ease: [0.25, 0.1, 0.25, 1],
                  layout: { duration: 0.2, ease: 'easeOut' },
                }}
                className='w-full'
                style={{ willChange: 'transform, opacity' }}
              >
                <ChatMessageComponent msg={msg} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      {debug && (
        <TwitchChatDebug
          onSendMessage={handleTestMessage}
          onSimulateSub={handleTestSub}
          onSimulateCheer={handleTestCheer}
          onSimulateGiftSub={handleTestGiftSub}
        />
      )}
    </div>
  )
}
