#!/usr/bin/env node
/**
 * Mints a fresh Spotify refresh token via the authorization code flow.
 *
 * Run this when /api/spotify/playback reports `auth_failed`. Refresh tokens
 * have no expiry, so `invalid_grant` means the old one was revoked or the
 * client credentials no longer match the app that issued it — which is why
 * this deliberately authorizes using the SAME client id/secret the app runs
 * with, keeping all three values consistent.
 *
 *   npm run spotify:auth
 */
import { spawn } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'

const PORT = 8888
// Spotify stopped accepting `localhost` in 2025 — loopback must be the
// explicit IP, and this must match the dashboard entry character for character.
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`

/**
 * user-read-playback-state is what /v1/me/player needs for device / shuffle /
 * repeat. Without it that call 403s and the app falls back to the narrower
 * /currently-playing endpoint.
 */
const SCOPES = ['user-read-currently-playing', 'user-read-playback-state']

const ESC = String.fromCharCode(27)
const style = code => s => `${ESC}[${code}m${s}${ESC}[0m`
const bold = style(1)
const dim = style(2)
const red = style(31)
const green = style(32)
const yellow = style(33)

/** Minimal .env.local reader — avoids a dependency just to read two keys. */
function loadEnvLocal() {
  try {
    for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
      if (!match) continue
      const [, key, rawValue] = match
      if (process.env[key]) continue
      process.env[key] = rawValue.trim().replace(/^["']|["']$/g, '')
    }
  } catch {
    // No .env.local is fine — the values may come from the shell instead.
  }
}

function openBrowser(url) {
  const cmd =
    process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open'
  try {
    spawn(cmd, [url], { stdio: 'ignore', detached: true, shell: process.platform === 'win32' })
      .on('error', () => {})
      .unref()
  } catch {
    // Headless or no handler — the URL is printed anyway.
  }
}

function page(title, message) {
  return `<!doctype html><meta charset="utf-8"><title>${title}</title>
<body style="font-family:system-ui,sans-serif;background:#0d1117;color:#e6edf3;display:grid;place-items:center;height:100vh;margin:0">
<div style="text-align:center;max-width:32rem;padding:2rem">
<h1 style="font-size:1.25rem">${title}</h1>
<p style="color:#8b949e;line-height:1.6">${message}</p>
</div></body>`
}

loadEnvLocal()

const clientId = process.env.SPOTIFY_CLIENT_ID
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

const missing = [
  !clientId && 'SPOTIFY_CLIENT_ID',
  !clientSecret && 'SPOTIFY_CLIENT_SECRET',
].filter(Boolean)

if (missing.length > 0) {
  console.error(red(`\n✗ 缺少環境變數：${missing.join(', ')}\n`))
  console.error('請在專案根目錄建立 .env.local：\n')
  console.error(dim('  SPOTIFY_CLIENT_ID=你的_client_id'))
  console.error(dim('  SPOTIFY_CLIENT_SECRET=你的_client_secret\n'))
  console.error('這兩個值要跟 Vercel 上設定的是同一組，否則換到的新 token 一樣不會動。')
  console.error(dim('可在 https://developer.spotify.com/dashboard 取得。\n'))
  process.exit(1)
}

const state = randomBytes(16).toString('hex')
const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
  client_id: clientId,
  response_type: 'code',
  redirect_uri: REDIRECT_URI,
  scope: SCOPES.join(' '),
  state,
  // Always re-prompt, so switching accounts doesn't silently reuse the old one.
  show_dialog: 'true',
})}`

async function exchangeCode(code) {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
    }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(
      `HTTP ${res.status} ${data.error ?? ''} ${data.error_description ?? ''}`.trim()
    )
  }
  return data
}

let settled = false

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`)
  if (url.pathname !== '/callback') {
    res.writeHead(404).end()
    return
  }
  if (settled) {
    res.writeHead(409, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(page('已經處理過了', '這個授權流程已經完成，請關閉分頁。'))
    return
  }

  const finish = (code, title, message) => {
    settled = true
    res.writeHead(code, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(page(title, message))
    // Close once the response has flushed.
    setTimeout(() => server.close(), 100)
  }

  const error = url.searchParams.get('error')
  if (error) {
    console.error(red(`\n✗ 授權被拒絕：${error}\n`))
    finish(400, '授權被拒絕', `Spotify 回報：${error}。可以關閉這個分頁了。`)
    process.exitCode = 1
    return
  }

  // Guards against another site walking the browser into this endpoint.
  if (url.searchParams.get('state') !== state) {
    console.error(red('\n✗ state 不符，已拒絕這次回呼（可能是偽造的請求）。\n'))
    finish(400, '驗證失敗', 'state 參數不符，已拒絕這次請求。')
    process.exitCode = 1
    return
  }

  const code = url.searchParams.get('code')
  if (!code) {
    finish(400, '缺少授權碼', '回呼網址沒有帶 code 參數。')
    process.exitCode = 1
    return
  }

  try {
    const token = await exchangeCode(code)
    // Deliberately not rendered in the browser: it would end up in history,
    // and these pages get screenshotted.
    finish(200, '授權完成 ✓', '可以關閉這個分頁，回到終端機複製 refresh token。')

    if (!token.refresh_token) {
      console.error(red('\n✗ Spotify 沒有回傳 refresh_token。\n'))
      process.exitCode = 1
      return
    }

    console.log(green('\n✓ 授權成功\n'))
    console.log(bold('SPOTIFY_REFRESH_TOKEN='))
    console.log(token.refresh_token)
    console.log(dim(`\n已取得的 scope：${token.scope ?? '(未回報)'}`))
    console.log(yellow('\n⚠ 這是長期有效的密鑰，請勿貼進 issue、截圖或聊天室。\n'))
    console.log('接下來：')
    console.log('  1. 把上面這串貼到 Vercel 的 SPOTIFY_REFRESH_TOKEN')
    console.log(`  2. ${bold('重新部署')}（只改環境變數不會套用到既有部署）`)
    console.log('  3. 開後台「Now Playing HUD」分頁，狀態應該變成 OK\n')
  } catch (err) {
    console.error(red(`\n✗ 交換 token 失敗：${err.message}\n`))
    console.error('常見原因：')
    console.error(`  · Dashboard 的 Redirect URI 沒有 ${bold(REDIRECT_URI)}（要逐字相符）`)
    console.error('  · SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET 不是同一個 app 的\n')
    finish(500, '交換 token 失敗', '請回到終端機查看錯誤訊息。')
    process.exitCode = 1
  }
})

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error(red(`\n✗ 連接埠 ${PORT} 已被占用，請關掉占用的程式後重試。\n`))
  } else {
    console.error(red(`\n✗ 無法啟動本機伺服器：${err.message}\n`))
  }
  process.exit(1)
})

// Bind to loopback only — this never needs to be reachable from the network.
server.listen(PORT, '127.0.0.1', () => {
  console.log(bold('\nSpotify 重新授權\n'))
  console.log('請先確認 Spotify Developer Dashboard → 你的 app → Settings → Redirect URIs')
  console.log('已加入這個網址（逐字相符）：\n')
  console.log(`  ${bold(REDIRECT_URI)}\n`)
  console.log(dim('（Spotify 自 2025 年起不接受 localhost，loopback 必須寫成 127.0.0.1）\n'))
  console.log('正在開啟瀏覽器進行授權，若沒有自動開啟請手動貼上：\n')
  console.log(dim(authUrl))
  console.log(`\n等待授權回呼中… ${dim('(Ctrl+C 取消)')}\n`)
  openBrowser(authUrl)
})
