'use client'

import { resolveArtworkSrc } from '@/lib/nowplaying/artworkSrc'
import { HudPalette } from '@/lib/nowplaying/palette'

type Props = {
  url: string | null
  palette: HudPalette
  glow: number
  size: number
  isPlaying: boolean
}

/**
 * Album artwork framed as an instrument readout. Routed through our proxy for
 * the same reason the palette extractor is — one cached fetch serves both.
 */
export default function Artwork({ url, palette, glow, size, isPlaying }: Props) {
  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        flexShrink: 0,
        border: `1px solid ${palette.dim}`,
        boxShadow: `0 0 ${18 * glow}px ${palette.glow}`,
        overflow: 'hidden',
        background: 'rgba(0,0,0,0.35)',
      }}
    >
      {url ? (
        /* eslint-disable-next-line @next/next/no-img-element --
           OBS overlay: the proxy already normalises these and next/image
           would only add an optimisation hop we do not want here. */
        <img
          src={resolveArtworkSrc(url)}
          alt=''
          width={size}
          height={size}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: isPlaying ? 'none' : 'saturate(0.45) brightness(0.8)',
            transition: 'filter 400ms ease',
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: `linear-gradient(135deg, ${palette.dim}, transparent 60%)`,
          }}
        />
      )}

      {/* Scanline wash keeps the cover reading as a HUD element, not a sticker. */}
      <span
        aria-hidden='true'
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 1px, transparent 1px, transparent 3px)',
          pointerEvents: 'none',
        }}
      />
      <span
        aria-hidden='true'
        style={{
          position: 'absolute',
          inset: 0,
          border: `1px solid ${palette.primary}`,
          opacity: 0.45,
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
