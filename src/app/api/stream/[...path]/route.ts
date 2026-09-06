import { NextRequest, NextResponse } from 'next/server'

import { streamApi } from '@/lib/streamApi'

const ALLOWED_PREFIXES = ['songList', 'repertoire', 'songRequest', 'messageBoard']

async function forward(req: NextRequest, path: string[]) {
  const [prefix] = path
  if (!ALLOWED_PREFIXES.includes(prefix)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const search = req.nextUrl.search
  const targetPath = `/${path.join('/')}${search}`

  const init: NonNullable<Parameters<typeof fetch>[1]> = { method: req.method }
  if (req.method !== 'GET' && req.method !== 'DELETE') {
    init.body = await req.text()
    init.headers = { 'Content-Type': req.headers.get('content-type') ?? 'application/json' }
  }

  const upstream = await streamApi(targetPath, init)
  const body = await upstream.text()

  return new NextResponse(body, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' },
  })
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return forward(req, (await params).path)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return forward(req, (await params).path)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return forward(req, (await params).path)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return forward(req, (await params).path)
}
