import { NextResponse } from 'next/server'
import { validateToken, getAccessToken } from '@/lib/twitchTokenManager'

export async function GET() {
  try {
    // 嘗試獲取 token（如果過期會自動刷新）
    const token = await getAccessToken()

    // 驗證 token 是否有效
    const isValid = await validateToken()

    return NextResponse.json({
      success: true,
      tokenPreview: token.slice(0, 10) + '...',  // 只顯示前 10 個字元
      isValid,
      message: isValid
        ? 'Token 自動刷新機制運作正常！'
        : 'Token 獲取成功但驗證失敗，請檢查 TWITCH_CLIENT_ID 和 TWITCH_CLIENT_SECRET',
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: '無法獲取 Token，請確認環境變數是否正確設定',
    }, { status: 500 })
  }
}
