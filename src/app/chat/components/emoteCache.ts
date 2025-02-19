export class EmoteCache {
  private static instance: EmoteCache
  private cache: Map<string, string> = new Map()
  private preloadPromises: Map<string, Promise<void>> = new Map()

  private constructor() {}

  static getInstance(): EmoteCache {
    if (!EmoteCache.instance) {
      EmoteCache.instance = new EmoteCache()
    }
    return EmoteCache.instance
  }

  async preloadEmote(emoteId: string, provider: '7tv' | 'twitch'): Promise<void> {
    if (this.preloadPromises.has(emoteId)) {
      return this.preloadPromises.get(emoteId)
    }

    const preloadPromise = new Promise<void>((resolve, reject) => {
      const img = new Image()

      img.onload = () => {
        const url =
          provider === '7tv'
            ? `https://cdn.7tv.app/emote/${emoteId}/2x`
            : `https://static-cdn.jtvnw.net/emoticons/v2/${emoteId}/default/light/2.0`
        this.cache.set(emoteId, url)
        resolve()
      }

      img.onerror = async () => {
        if (provider === '7tv') {
          // Fallback to WebP format for 7TV
          const webpUrl = `https://cdn.7tv.app/emote/${emoteId}/2x.webp`
          try {
            const response = await fetch(webpUrl)
            if (response.ok) {
              this.cache.set(emoteId, webpUrl)
              resolve()
            } else {
              reject(new Error(`Failed to load emote: ${emoteId}`))
            }
          } catch (error) {
            reject(error)
          }
        } else {
          reject(new Error(`Failed to load emote: ${emoteId}`))
        }
      }

      img.src =
        provider === '7tv'
          ? `https://cdn.7tv.app/emote/${emoteId}/2x`
          : `https://static-cdn.jtvnw.net/emoticons/v2/${emoteId}/default/light/2.0`
    })

    this.preloadPromises.set(emoteId, preloadPromise)
    return preloadPromise
  }

  getEmoteUrl(emoteId: string): string | undefined {
    return this.cache.get(emoteId)
  }
}
