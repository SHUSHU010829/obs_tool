import axios from 'axios'

interface TokenData {
  accessToken: string
  expiresAt: number // Unix timestamp in milliseconds
}

let cachedToken: TokenData | null = null

/**
 * 使用 Client Credentials Flow 獲取 App Access Token
 * https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#client-credentials-grant-flow
 */
async function fetchNewToken(): Promise<TokenData> {
  const clientId = process.env.TWITCH_CLIENT_ID
  const clientSecret = process.env.TWITCH_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Missing TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET environment variables')
  }

  try {
    const response = await axios.post(
      'https://id.twitch.tv/oauth2/token',
      null,
      {
        params: {
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'client_credentials',
        },
      }
    )

    const { access_token, expires_in } = response.data

    // expires_in 是秒數，轉換為毫秒並預留 5 分鐘緩衝時間
    const expiresAt = Date.now() + (expires_in - 300) * 1000

    console.log('[TwitchTokenManager] New token fetched, expires in', expires_in, 'seconds')

    return {
      accessToken: access_token,
      expiresAt,
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error('Failed to fetch Twitch token: ' + error.message)
    }
    throw new Error('Unknown error occurred while fetching Twitch token')
  }
}

/**
 * 檢查 token 是否有效（未過期）
 */
function isTokenValid(): boolean {
  if (!cachedToken) return false
  return Date.now() < cachedToken.expiresAt
}

/**
 * 獲取有效的 Access Token
 * 如果快取的 token 已過期，會自動獲取新的
 */
export async function getAccessToken(): Promise<string> {
  if (!isTokenValid()) {
    cachedToken = await fetchNewToken()
  }
  return cachedToken!.accessToken
}

/**
 * 獲取用於 API 請求的 Authorization header 值
 * 格式：Bearer {token}
 */
export async function getAuthorizationHeader(): Promise<string> {
  const token = await getAccessToken()
  return `Bearer ${token}`
}

/**
 * 強制刷新 token（用於 token 失效的情況）
 */
export async function refreshToken(): Promise<string> {
  cachedToken = await fetchNewToken()
  return cachedToken.accessToken
}

/**
 * 驗證目前的 token 是否有效（呼叫 Twitch API 確認）
 */
export async function validateToken(): Promise<boolean> {
  try {
    const token = await getAccessToken()
    const response = await axios.get('https://id.twitch.tv/oauth2/validate', {
      headers: {
        Authorization: `OAuth ${token}`,
      },
    })
    return response.status === 200
  } catch {
    return false
  }
}
