/**
 * 客戶端用的 Twitch API 調用函數
 * 這些函數會調用伺服器端的 API routes，token 獲取完全在伺服器端進行
 */

export async function getStreams() {
  const response = await fetch('/api/twitch/streams')
  if (!response.ok) {
    throw new Error('Failed to fetch streams')
  }
  return response.json()
}

export async function getChannelBadges(broadcasterId: string) {
  const response = await fetch(`/api/twitch/badges/channel?broadcaster_id=${broadcasterId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch channel badges')
  }
  return response.json()
}

export async function getGlobalBadges() {
  const response = await fetch('/api/twitch/badges/global')
  if (!response.ok) {
    throw new Error('Failed to fetch global badges')
  }
  return response.json()
}
