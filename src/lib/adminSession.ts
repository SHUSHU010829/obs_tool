export const SESSION_COOKIE_NAME = 'obs_admin_session'
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000

function toBase64Url(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function sign(secret: string, data: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  return toBase64Url(signature)
}

function timingSafeEqualString(a: string, b: string) {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return mismatch === 0
}

export async function createSessionCookieValue(secret: string) {
  const expiry = String(Date.now() + SESSION_TTL_MS)
  const signature = await sign(secret, expiry)
  return `${expiry}.${signature}`
}

export async function verifySessionCookieValue(secret: string, value: string | undefined) {
  if (!value) return false
  const [expiry, signature] = value.split('.')
  if (!expiry || !signature) return false
  if (!Number.isFinite(Number(expiry)) || Number(expiry) < Date.now()) return false
  const expected = await sign(secret, expiry)
  return timingSafeEqualString(signature, expected)
}
