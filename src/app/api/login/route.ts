import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

import { createSessionCookieValue, SESSION_COOKIE_NAME } from '@/lib/adminSession'

function timingSafeEqualString(a: string, b: string) {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}

export async function POST(req: NextRequest) {
  const sessionSecret = process.env.SESSION_SECRET
  const expectedUser = process.env.ADMIN_BASIC_USER
  const expectedPass = process.env.ADMIN_BASIC_PASS

  if (!sessionSecret || !expectedUser || !expectedPass) {
    return NextResponse.json({ message: '伺服器尚未設定登入所需的環境變數' }, { status: 500 })
  }

  const { username, password } = await req.json()

  if (
    typeof username !== 'string' ||
    typeof password !== 'string' ||
    !timingSafeEqualString(username, expectedUser) ||
    !timingSafeEqualString(password, expectedPass)
  ) {
    return NextResponse.json({ message: '帳號或密碼錯誤' }, { status: 401 })
  }

  const cookieValue = await createSessionCookieValue(sessionSecret)
  const res = NextResponse.json({ success: true })
  res.cookies.set(SESSION_COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  return res
}
