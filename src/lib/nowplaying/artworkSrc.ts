/**
 * Resolves an artwork URL to something the browser can actually load.
 *
 * Remote Spotify CDN images go through our proxy so a <canvas> read for colour
 * extraction isn't blocked by CORS. Same-origin and inline (demo) artwork is
 * already readable and must bypass the proxy, whose host allowlist would
 * reject it.
 */
export function resolveArtworkSrc(url: string): string {
  if (url.startsWith('data:') || url.startsWith('/')) return url
  return `/api/spotify/artwork?url=${encodeURIComponent(url)}`
}
