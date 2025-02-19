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
      return <span>{fragment.content}</span>
    }

    if (!imageUrl) {
      return <span className='w-6 h-6 bg-gray-200 rounded animate-pulse inline-block' />
    }

    return (
      <img
        src={imageUrl}
        alt='emote'
        className='inline-block h-6'
        style={{ verticalAlign: 'middle' }}
      />
    )
  }
)

MessageFragment.displayName = 'MessageFragment'

export default MessageFragment
