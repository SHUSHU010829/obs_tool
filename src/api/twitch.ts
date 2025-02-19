import axios from 'axios'

export async function getStreams() {
  const config = {
    headers: {
      Authorization: process.env.TWITCH_ACCESS_TOKEN,
      'Client-Id': process.env.TWITCH_CLIENT_ID,
    },
  }

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
  const config = {
    headers: {
      Authorization: process.env.TWITCH_ACCESS_TOKEN,
      'Client-Id': process.env.TWITCH_CLIENT_ID,
    },
    params: {
      broadcaster_id: broadcaster_id.toString(),
    },
  }

  try {
    const response = await axios.get('https://api.twitch.tv/helix/chat/badges', config)
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
  const config = {
    headers: {
      Authorization: process.env.TWITCH_ACCESS_TOKEN,
      'Client-Id': process.env.TWITCH_CLIENT_ID,
    },
  }

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
