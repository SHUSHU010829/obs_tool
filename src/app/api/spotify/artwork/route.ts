import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Spotify's image CDN does not reliably send CORS headers, which taints a
 * <canvas> and makes getImageData() throw — so client-side colour extraction
 * cannot read the artwork directly. Proxying the bytes through our own origin
 * sidesteps that without pulling in a server-side image decoder.
 */
const ALLOWED_HOSTS = new Set(['i.scdn.co', 'mosaic.scdn.co', 'lineup-images.scdn.co'])

/** Also allow Spotify's newer CDN shards, e.g. image-cdn-ak.spotifycdn.com. */
function isAllowedHost(hostname: string): boolean {
  return ALLOWED_HOSTS.has(hostname) || hostname.endsWith('.spotifycdn.com')
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('url')
  if (!raw) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
  }

  let target: URL
  try {
    target = new URL(raw)
  } catch {
    return NextResponse.json({ error: 'Invalid url parameter' }, { status: 400 })
  }

  // Without this allowlist the route would be an open forwarding proxy (SSRF).
  if (target.protocol !== 'https:' || !isAllowedHost(target.hostname)) {
    return NextResponse.json({ error: 'Host not allowed' }, { status: 403 })
  }

  try {
    const upstream = await fetch(target.toString(), { cache: 'no-store' })
    if (!upstream.ok) {
      return NextResponse.json({ error: 'Upstream fetch failed' }, { status: 502 })
    }

    const contentType = upstream.headers.get('content-type') ?? 'image/jpeg'
    if (!contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'Upstream is not an image' }, { status: 502 })
    }

    return new NextResponse(await upstream.arrayBuffer(), {
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    })
  } catch (error) {
    console.error('Error proxying spotify artwork:', error)
    return NextResponse.json({ error: 'Failed to fetch artwork' }, { status: 502 })
  }
}
