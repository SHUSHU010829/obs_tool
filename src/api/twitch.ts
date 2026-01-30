import axios from 'axios'
import { getAuthorizationHeader } from '@/lib/twitchTokenManager'

async function getTwitchConfig() {
  return {
    headers: {
      Authorization: await getAuthorizationHeader(),
      'Client-Id': process.env.TWITCH_CLIENT_ID,
    },
  }
}

export async function getStreams() {
  const config = await getTwitchConfig()

  try {
    const response = await axios.get(
      'https://api.twitch.tv/helix/streams?user_id=720691521',
      config
    )
    return response.data
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error('Error saving data: ' + error.message)
    } else {
      throw new Error('Unknown error occurred')
    }
  }
}

export async function getChannelBadges(broadcaster_id: string) {
  const config = await getTwitchConfig()
  config.headers = {
    ...config.headers,
  }

  try {
    const response = await axios.get('https://api.twitch.tv/helix/chat/badges', {
      ...config,
      params: {
        broadcaster_id: broadcaster_id.toString(),
      },
    })
    return response.data
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error('Error saving data: ' + error.message)
    } else {
      throw new Error('Unknown error occurred')
    }
  }
}

export async function getGlobalBadges() {
  const config = await getTwitchConfig()

  try {
    const response = await axios.get(
      'https://api.twitch.tv/helix/chat/badges/global',
      config
    )
    return response.data
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error('Error saving data: ' + error.message)
    } else {
      throw new Error('Unknown error occurred')
    }
  }
}
