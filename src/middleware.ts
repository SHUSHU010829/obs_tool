import { NextRequest, NextResponse } from 'next/server'

import { SESSION_COOKIE_NAME, verifySessionCookieValue } from '@/lib/adminSession'

export async function middleware(req: NextRequest) {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'SESSION_SECRET not configured' }, { status: 500 })
  }

  const cookie = req.cookies.get(SESSION_COOKIE_NAME)?.value
  const authenticated = await verifySessionCookieValue(secret, cookie)

  if (authenticated) {
    return NextResponse.next()
  }

  if (req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const loginUrl = new URL('/login', req.url)
  loginUrl.searchParams.set('next', req.nextUrl.pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/', '/api/stream/:path*'],
}
