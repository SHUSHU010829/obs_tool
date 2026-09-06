import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const user = process.env.ADMIN_BASIC_USER
  const pass = process.env.ADMIN_BASIC_PASS

  if (!user || !pass) {
    return NextResponse.json(
      { error: 'ADMIN_BASIC_USER / ADMIN_BASIC_PASS not configured' },
      { status: 500 }
    )
  }

  const authHeader = req.headers.get('authorization')
  const expected = 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64')

  if (authHeader === expected) {
    return NextResponse.next()
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="obs_tool admin"' },
  })
}

export const config = {
  matcher: ['/', '/api/stream/:path*'],
}
