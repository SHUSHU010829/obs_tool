import { EmoteCache } from './emoteCache'
import { memo, useEffect, useState } from 'react'

const MessageFragment = memo(
  ({
    fragment,
  }: {
    fragment: {
      type: 'text' | 'emote'
      content: string
      provider?: string
    }
    messageId: string
    index: number
  }) => {
    const emoteCache = EmoteCache.getInstance()
    const [imageUrl, setImageUrl] = useState<string>('')

    useEffect(() => {
      if (fragment.type === 'emote' && fragment.provider) {
        const cachedUrl = emoteCache.getEmoteUrl(fragment.content)
        if (cachedUrl) {
          setImageUrl(cachedUrl)
        } else {
          emoteCache
            .preloadEmote(fragment.content, fragment.provider as '7tv' | 'twitch')
            .then(() => {
              const url = emoteCache.getEmoteUrl(fragment.content)
              if (url) setImageUrl(url)
            })
            .catch(console.error)
        }
      }
    }, [fragment])

    if (fragment.type === 'text') {
      return <span className='whitespace-pre-wrap'>{fragment.content}</span> // 保持空格與換行
    }

    if (!imageUrl) {
      return (
        <span className='w-6 h-6 bg-gray-200 rounded animate-pulse inline-block mx-1' />
      )
    }

    return (
      <img
        src={imageUrl}
        alt='emote'
        className='inline-block h-6 mx-[2px] align-middle' // 確保 emote 間有間距
        style={{ verticalAlign: 'middle' }} // 確保對齊
      />
    )
  }
)

MessageFragment.displayName = 'MessageFragment'

export default MessageFragment
