'use client'

import TwitchChatDebug from './debug'
import { EmoteCache } from './emoteCache'
import MessageFragment from './messageFragment'
import { getChannelBadges, getGlobalBadges } from '@/api/twitch'
import { ShineBorder } from '@/components/ui/shine-border'
import { motion } from 'framer-motion'
import { useEffect, useState, memo, useCallback, useRef } from 'react'
import tmi from 'tmi.js'

interface ParsedEmote {
  id: string
  name: string
  imageUrl: string
  start: number
  end: number
  provider: 'twitch' | '7tv' | 'bttv' | 'ffz'
}

interface BadgeVersion {
  id: string
  image_url_1x: string
  image_url_2x: string
  image_url_4x: string
  title: string
  description: string
  click_action: string
  click_url: string | null
}

interface BadgeSet {
  set_id: string
  versions: BadgeVersion[]
}

interface ChatMessage {
  user: string
  type: 'message' | 'subscription' | 'cheer' | 'announcement'
  bits?: number
  subPlan?: 'Prime' | '1000' | '2000' | '3000'
  subMonths?: number
  subGifter?: string
  systemMsg?: string

  message: string
  badges: Record<string, string | undefined>
  emotes: Record<string, string[]> | null | undefined
  sevenTVEmotes?: any
  parsedEmotes: ParsedEmote[]
  messageFragments: { type: 'text' | 'emote'; content: string; provider?: string }[]
  isSubscriber: boolean
  isMod: boolean
  id: string
  role: 'broadcaster' | 'mod' | 'vip' | 'subscriber' | 'noRole'
  timestamp: number
  channelBadges?: BadgeSet[] // 完整的徽章資料
}

interface SevenTVEmote {
  id: string
  name: string
  flags: number
  timestamp: number
  actor_id: string
  data: {
    id: string
    name: string
    flags: number
    lifecycle: number
    state: string[]
    listed: boolean
    animated: boolean
    owner: {
      id: string
      username: string
      display_name: string
      avatar_url: string
      style: {
        color: number
      }
      roles: string[]
    }
  }
}

const SystemMessage = memo(({ msg }: { msg: ChatMessage }) => {
  console.log('🚀 ~ SystemMessage ~ msg:', msg)
  const getBgColor = () => {
    switch (msg.type) {
      case 'subscription':
        return 'bg-stone-100'
      case 'cheer':
        return 'bg-stone-100'
      default:
        return 'bg-stone-100'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ShineBorder
        className={`rounded-lg ${getBgColor()}`}
        color={['#A07CFE', '#FE8FB5', '#FFBE7B']}
      >
        <div className='text-sm font-medium'>
          {msg.type === 'subscription' && (
            <div className='flex items-center justify-center space-x-2'>
              <div>
                {msg.subGifter ? (
                  <div>
                    {msg.subGifter} 贈送了一個訂閱給
                    <br /> {msg.user}！
                  </div>
                ) : (
                  `${msg.user} ${
                    msg.subMonths && msg.subMonths > 1
                      ? `續訂了 ${msg.subMonths} 個月！`
                      : '訂閱了頻道！'
                  }`
                )}
              </div>
            </div>
          )}
          {msg.type === 'cheer' && (
            <div className='flex items-center justify-center space-x-2'>
              <img
                src={`https://d3aqoihi2n8ty8.cloudfront.net/actions/cheer/light/animated/1000/4.gif`}
                className='w-5 h-5'
                alt='Bits Badge'
              />
              <span>
                {msg.user} 丟了 {msg.bits} 小顆粒！
              </span>
            </div>
          )}
        </div>
        {msg.message && (
          <div className='mt-2 text-sm'>
            <MessageContent fragments={msg.messageFragments} messageId={msg.id} />
          </div>
        )}
      </ShineBorder>
    </motion.div>
  )
})

SystemMessage.displayName = 'SystemMessage'

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
  }) => (
    <>
      {fragments.map((fragment, index) => (
        <MessageFragment
          key={`${messageId}-fragment-${index}`}
          fragment={fragment}
          messageId={messageId}
          index={index}
        />
      ))}
    </>
  )
)
MessageContent.displayName = 'MessageContent'

const ChatMessageComponent = memo(({ msg }: { msg: ChatMessage }) => {
  const renderBadges = () => {
    if (!msg.channelBadges || msg.channelBadges.length === 0) return null

    return (
      <div className='flex items-center space-x-1'>
        {msg.channelBadges.map((badgeSet, badgeIndex) =>
          badgeSet.versions.map((version, versionIndex) => (
            <img
              key={`badge-${badgeSet.set_id}-${version.id}-${badgeIndex}-${versionIndex}`}
              src={version.image_url_2x || version.image_url_1x} // 確保使用正確的 URL
              alt={version.title}
              title={version.title}
              className='h-4 w-4' // 稍微調整大小，確保可見
              loading='lazy'
            />
          ))
        )}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className='w-full flex flex-col space-y-1'
    >
      <div className='w-fit relative flex flex-col items-start'>
        {/* 徽章與人名 */}
        <div
          className='flex items-center space-x-2 rounded-3xl bg-[#bdc3ad] py-1 px-2 z-10 relative w-auto max-w-max'
          style={{
            transform: 'rotate(-4deg)',
            transformOrigin: 'left',
            bottom: '-6px', // 讓這個區塊稍微覆蓋訊息框
          }}
        >
          {renderBadges()}
          <span className='font-bold text-xs'>{msg.user}</span>
        </div>

        {/* 訊息內容 */}
        <div className='flex items-center translate-x-[-10px]'>
          <div className='w-4 overflow-hidden translate-x-[4px] -translate-y-1'>
            <div className='h-3 bg-gray-200 rotate-45 transform origin-bottom-right rounded-sm'></div>
          </div>
          <div className='relative text-gray-900 rounded-3xl bg-gray-200 pb-2 pt-3 px-3 z-0 flex items-center w-auto max-w-max text-sm'>
            <MessageContent fragments={msg.messageFragments} messageId={msg.id} />
          </div>
        </div>
      </div>
    </motion.div>
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

  // 自動滾動到底部
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
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

      const mockUserstate = {
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
        badges: mockUserstate.badges || {},
        emotes: null,
        parsedEmotes: [],
        messageFragments: message
          ? parseMessageWithEmotes(message, null).messageFragments
          : [],
        isSubscriber: true,
        isMod: false,
        id: mockUserstate.id,
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
      const mockUserstate = {
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
        badges: mockUserstate.badges || {},
        emotes: null,
        parsedEmotes: [],
        messageFragments: parseMessageWithEmotes(message, null).messageFragments,
        isSubscriber: true,
        isMod: false,
        id: mockUserstate.id,
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

      const mockUserstate = {
        badges: { subscriber: '0' },
        'display-name': gifter,
        id: `test-giftsub-${Date.now()}`,
        mod: false,
        subscriber: true,
      }

      const newMessage: ChatMessage = {
        type: 'subscription',
        user: recipient,
        message: '',
        badges: mockUserstate.badges || {},
        emotes: null,
        parsedEmotes: [],
        messageFragments: [],
        isSubscriber: true,
        isMod: false,
        id: mockUserstate.id,
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
    <div className=''>
      <div className='relative h-[540px] w-[300px] pt-4'>
        <div
          className='flex flex-col space-y-3 overflow-y-auto max-h-[540px] scrollbar-hide p-1'
          ref={chatContainerRef} // 參考滾動容器
        >
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`w-full`}
            >
              <ChatMessageComponent msg={msg} />
              {/* {msg.type === 'message' ? (
                <ChatMessageComponent msg={msg} />
              ) : (
                <SystemMessage msg={msg} />
              )} */}
            </motion.div>
          ))}
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
