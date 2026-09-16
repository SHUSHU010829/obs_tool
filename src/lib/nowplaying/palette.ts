'use client'

import { resolveArtworkSrc } from './artworkSrc'
import { useEffect, useState } from 'react'

/** Every colour the visual layer is allowed to use. */
export type HudPalette = {
  primary: string
  accent: string
  glow: string
  dim: string
  text: string
  textMuted: string
}

/** Used before artwork loads, for greyscale covers, and when color is locked. */
export const DEFAULT_PALETTE: HudPalette = paletteFromHsl(158, 1, 0.5)

/** Artwork is downsampled to this before sampling — plenty for a dominant hue. */
const SAMPLE_SIZE = 48
const HUE_BUCKETS = 24
/** Below this share of usable pixels we treat the cover as greyscale. */
const MIN_COLORFUL_RATIO = 0.05

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2

  if (max === min) return [0, 0, l]

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h: number
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
  else if (max === gn) h = ((bn - rn) / d + 2) / 6
  else h = ((rn - gn) / d + 4) / 6

  return [h * 360, s, l]
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const hp = (((h % 360) + 360) % 360) / 60
  const x = c * (1 - Math.abs((hp % 2) - 1))
  const [r1, g1, b1] =
    hp < 1
      ? [c, x, 0]
      : hp < 2
        ? [x, c, 0]
        : hp < 3
          ? [0, c, x]
          : hp < 4
            ? [0, x, c]
            : hp < 5
              ? [x, 0, c]
              : [c, 0, x]
  const m = l - c / 2
  return [
    Math.round((r1 + m) * 255),
    Math.round((g1 + m) * 255),
    Math.round((b1 + m) * 255),
  ]
}

function hex(h: number, s: number, l: number): string {
  const [r, g, b] = hslToRgb(h, s, l)
  return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`
}

function rgba(h: number, s: number, l: number, alpha: number): string {
  const [r, g, b] = hslToRgb(h, s, l)
  return `rgba(${r},${g},${b},${alpha})`
}

/**
 * Derives a full HUD palette from one hue. Lightness is floored well above the
 * overlay's dark/transparent backdrop so text and hairlines stay legible
 * whatever the cover looks like.
 */
export function paletteFromHsl(h: number, s: number, l: number): HudPalette {
  const sat = Math.min(1, Math.max(0.45, s))
  const light = Math.min(0.68, Math.max(0.5, l))

  return {
    primary: hex(h, sat, light),
    accent: hex(h + 32, sat, Math.min(0.75, light + 0.08)),
    glow: rgba(h, sat, light, 0.45),
    dim: rgba(h, sat * 0.7, light, 0.18),
    text: hex(h, Math.min(0.35, sat * 0.4), 0.92),
    textMuted: rgba(h, Math.min(0.3, sat * 0.35), 0.85, 0.55),
  }
}

export function paletteFromHex(value: string): HudPalette {
  const r = parseInt(value.slice(1, 3), 16)
  const g = parseInt(value.slice(3, 5), 16)
  const b = parseInt(value.slice(5, 7), 16)
  const [h, s, l] = rgbToHsl(r, g, b)
  return paletteFromHsl(h, s, l)
}

/**
 * Picks the dominant *vibrant* hue. Near-black, near-white and washed-out
 * pixels are discarded first, then hues are bucketed and weighted by
 * saturation so a small vivid accent can still beat a large dull background.
 */
export function extractPalette(pixels: Uint8ClampedArray): HudPalette | null {
  const weights = new Array<number>(HUE_BUCKETS).fill(0)
  const satSum = new Array<number>(HUE_BUCKETS).fill(0)
  const lightSum = new Array<number>(HUE_BUCKETS).fill(0)
  const counts = new Array<number>(HUE_BUCKETS).fill(0)

  let considered = 0
  let colorful = 0

  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] < 128) continue
    considered++

    const [h, s, l] = rgbToHsl(pixels[i], pixels[i + 1], pixels[i + 2])
    if (l < 0.12 || l > 0.92 || s < 0.18) continue
    colorful++

    const bucket = Math.min(HUE_BUCKETS - 1, Math.floor((h / 360) * HUE_BUCKETS))
    weights[bucket] += s * s
    satSum[bucket] += s
    lightSum[bucket] += l
    counts[bucket] += 1
  }

  // A greyscale or near-monochrome cover has nothing meaningful to extract;
  // inventing a hue from a handful of stray pixels looks like a bug.
  if (considered === 0 || colorful / considered < MIN_COLORFUL_RATIO) return null

  let best = 0
  for (let i = 1; i < HUE_BUCKETS; i++) {
    if (weights[i] > weights[best]) best = i
  }
  if (counts[best] === 0) return null

  // Bucket centre is close enough at 15-degree resolution.
  const hue = (best + 0.5) * (360 / HUE_BUCKETS)
  return paletteFromHsl(hue, satSum[best] / counts[best], lightSum[best] / counts[best])
}

/**
 * Loads artwork through our same-origin proxy (the Spotify CDN would taint the
 * canvas) and extracts a palette from it. Falls back to DEFAULT_PALETTE on any
 * failure — a missing colour must never blank the HUD.
 */
export function useArtworkPalette(
  artworkUrl: string | null,
  override: string
): HudPalette {
  const [palette, setPalette] = useState<HudPalette>(DEFAULT_PALETTE)

  useEffect(() => {
    if (override !== 'auto') {
      setPalette(paletteFromHex(override))
      return
    }

    if (!artworkUrl) {
      setPalette(DEFAULT_PALETTE)
      return
    }

    let cancelled = false
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      if (cancelled) return
      try {
        const canvas = document.createElement('canvas')
        canvas.width = SAMPLE_SIZE
        canvas.height = SAMPLE_SIZE
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) return

        ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE)
        const data = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE).data
        setPalette(extractPalette(data) ?? DEFAULT_PALETTE)
      } catch {
        // Tainted canvas, or getImageData blocked — keep the default.
        setPalette(DEFAULT_PALETTE)
      }
    }

    img.onerror = () => {
      if (!cancelled) setPalette(DEFAULT_PALETTE)
    }

    img.src = resolveArtworkSrc(artworkUrl)

    return () => {
      cancelled = true
    }
  }, [artworkUrl, override])

  return palette
}
