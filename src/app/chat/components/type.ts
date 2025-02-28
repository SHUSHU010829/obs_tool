export interface ParsedEmote {
  id: string
  name: string
  imageUrl: string
  start: number
  end: number
  provider: 'twitch' | '7tv' | 'bttv' | 'ffz'
}

export interface BadgeVersion {
  id: string
  image_url_1x: string
  image_url_2x: string
  image_url_4x: string
  title: string
  description: string
  click_action: string
  click_url: string | null
}

export interface BadgeSet {
  set_id: string
  versions: BadgeVersion[]
}

export interface ChatMessage {
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

export interface SevenTVEmote {
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
