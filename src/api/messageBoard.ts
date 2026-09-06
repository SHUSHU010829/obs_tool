import axios from 'axios'

function generateApiUrl(endpoint: string) {
  return `/api/stream/messageBoard${endpoint}`
}

// 取得留言板
export async function getMsgBoard() {
  const endpoint = ''

  try {
    const response = await axios.get(generateApiUrl(endpoint))
    return response
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error('Error saving data: ' + error.message)
    } else {
      throw new Error('Unknown error occurred')
    }
  }
}
