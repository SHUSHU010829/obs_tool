import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const url = process.env.DISCORD_BOT_SCORE_URL
  const secret = process.env.DISCORD_BOT_SCORE_SECRET

  if (!url || !secret) {
    return NextResponse.json(
      { error: 'bot endpoint not configured' },
      { status: 500 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  let upstream: Response
  try {
    upstream = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify(body),
    })
  } catch (err) {
    console.error('[flush-chat-score] upstream fetch failed', err)
    return NextResponse.json(
      { error: 'bot unreachable' },
      { status: 502 }
    )
  }

  const text = await upstream.text()
  const contentType = upstream.headers.get('content-type') ?? 'application/json'
  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'content-type': contentType },
  })
}
