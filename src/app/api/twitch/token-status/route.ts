import { NextResponse } from 'next/server'
import { validateToken, getAccessToken } from '@/lib/twitchTokenManager'

export async function GET() {
  // 先檢查環境變數
  const clientId = process.env.TWITCH_CLIENT_ID
  const clientSecret = process.env.TWITCH_CLIENT_SECRET

  const envStatus = {
    TWITCH_CLIENT_ID: clientId ? `已設定 (${clientId.slice(0, 5)}...)` : '❌ 未設定',
    TWITCH_CLIENT_SECRET: clientSecret ? `已設定 (${clientSecret.slice(0, 5)}...)` : '❌ 未設定',
  }

  if (!clientId || !clientSecret) {
    return NextResponse.json({
      success: false,
      envStatus,
      message: '環境變數未完整設定，請在 Zeabur 或 .env.local 中設定 TWITCH_CLIENT_ID 和 TWITCH_CLIENT_SECRET',
    }, { status: 500 })
  }

  try {
    // 嘗試獲取 token（如果過期會自動刷新）
    const token = await getAccessToken()

    // 驗證 token 是否有效
    const isValid = await validateToken()

    return NextResponse.json({
      success: true,
      envStatus,
      tokenPreview: token.slice(0, 10) + '...',
      isValid,
      message: isValid
        ? '✅ Token 自動刷新機制運作正常！'
        : '⚠️ Token 獲取成功但驗證失敗',
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json({
      success: false,
      envStatus,
      error: errorMessage,
      message: '❌ 無法獲取 Token',
      hint: errorMessage.includes('403')
        ? '403 錯誤通常表示 Client ID 或 Client Secret 不正確，請到 https://dev.twitch.tv/console 確認'
        : '請檢查環境變數是否正確',
    }, { status: 500 })
  }
}
