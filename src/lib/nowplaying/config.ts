/**
 * Single source of truth for every HUD option. The overlay reads it from the
 * URL; the admin studio writes it back out to a URL. Nothing here knows about
 * Spotify — this is purely the visual layer's configuration.
 */

export type HudFont = 'spaceMono' | 'montserrat' | 'poppins' | 'notoSans'

export type HudConfig = {
  layout: string
  viz: string
  showArtwork: boolean
  /** 'auto' derives the palette from the artwork; otherwise a #rrggbb hex. */
  color: string
  opacity: number
  glow: number
  font: HudFont
  /** Animation speed multiplier. */
  speed: number
  barCount: number
  fps: number
  showScanlines: boolean
  showGrid: boolean
  showTechReadout: boolean
  /** Renders a synthetic track so the HUD can be styled without Spotify. */
  demo: boolean
}

export const HUD_DEFAULTS: HudConfig = {
  layout: 'bar',
  viz: 'bars',
  showArtwork: true,
  color: 'auto',
  opacity: 1,
  glow: 1,
  font: 'spaceMono',
  speed: 1,
  barCount: 64,
  fps: 60,
  showScanlines: true,
  showGrid: true,
  showTechReadout: true,
  demo: false,
}

export const HUD_FONTS: { value: HudFont; label: string; className: string }[] = [
  { value: 'spaceMono', label: 'Space Mono', className: 'font-spaceMono' },
  { value: 'montserrat', label: 'Montserrat', className: 'font-montserrat' },
  { value: 'poppins', label: 'Poppins', className: 'font-poppins' },
  { value: 'notoSans', label: 'Noto Sans TC', className: 'font-notoSans' },
]

export function fontClassName(font: HudFont): string {
  return HUD_FONTS.find(f => f.value === font)?.className ?? 'font-spaceMono'
}

const HEX_RE = /^#[0-9a-f]{6}$/i

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function num(
  params: URLSearchParams,
  key: string,
  fallback: number,
  min: number,
  max: number
) {
  const raw = params.get(key)
  if (raw === null) return fallback
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? clamp(parsed, min, max) : fallback
}

function bool(params: URLSearchParams, key: string, fallback: boolean): boolean {
  const raw = params.get(key)
  if (raw === null) return fallback
  return raw === '1' || raw === 'true'
}

function oneOf<T extends string>(
  params: URLSearchParams,
  key: string,
  allowed: readonly T[],
  fallback: T
): T {
  const raw = params.get(key)
  return raw !== null && (allowed as readonly string[]).includes(raw)
    ? (raw as T)
    : fallback
}

/**
 * Parses and clamps. A hand-edited OBS URL should never be able to blank the
 * overlay out — unknown values silently fall back to the defaults.
 */
export function parseHudConfig(
  params: URLSearchParams,
  opts: { layouts: readonly string[]; visualizers: readonly string[] }
): HudConfig {
  const rawColor = params.get('color')
  const color =
    rawColor && HEX_RE.test(rawColor)
      ? rawColor.toLowerCase()
      : rawColor === 'auto'
        ? 'auto'
        : HUD_DEFAULTS.color

  return {
    layout: oneOf(params, 'layout', opts.layouts, HUD_DEFAULTS.layout),
    viz: oneOf(params, 'viz', opts.visualizers, HUD_DEFAULTS.viz),
    showArtwork: bool(params, 'art', HUD_DEFAULTS.showArtwork),
    color,
    opacity: num(params, 'opacity', HUD_DEFAULTS.opacity, 0.1, 1),
    glow: num(params, 'glow', HUD_DEFAULTS.glow, 0, 2),
    font: oneOf(
      params,
      'font',
      HUD_FONTS.map(f => f.value),
      HUD_DEFAULTS.font
    ),
    speed: num(params, 'speed', HUD_DEFAULTS.speed, 0.1, 3),
    barCount: Math.round(num(params, 'bars', HUD_DEFAULTS.barCount, 8, 192)),
    fps: Math.round(num(params, 'fps', HUD_DEFAULTS.fps, 15, 60)),
    showScanlines: bool(params, 'scanlines', HUD_DEFAULTS.showScanlines),
    showGrid: bool(params, 'grid', HUD_DEFAULTS.showGrid),
    showTechReadout: bool(params, 'readout', HUD_DEFAULTS.showTechReadout),
    demo: bool(params, 'demo', HUD_DEFAULTS.demo),
  }
}

/** Serializes back to a query string, omitting anything left at its default. */
export function serializeHudConfig(config: HudConfig): string {
  const params = new URLSearchParams()
  const put = (key: string, value: string, isDefault: boolean) => {
    if (!isDefault) params.set(key, value)
  }

  put('layout', config.layout, config.layout === HUD_DEFAULTS.layout)
  put('viz', config.viz, config.viz === HUD_DEFAULTS.viz)
  put(
    'art',
    config.showArtwork ? '1' : '0',
    config.showArtwork === HUD_DEFAULTS.showArtwork
  )
  put('color', config.color, config.color === HUD_DEFAULTS.color)
  put('opacity', String(config.opacity), config.opacity === HUD_DEFAULTS.opacity)
  put('glow', String(config.glow), config.glow === HUD_DEFAULTS.glow)
  put('font', config.font, config.font === HUD_DEFAULTS.font)
  put('speed', String(config.speed), config.speed === HUD_DEFAULTS.speed)
  put('bars', String(config.barCount), config.barCount === HUD_DEFAULTS.barCount)
  put('fps', String(config.fps), config.fps === HUD_DEFAULTS.fps)
  put(
    'scanlines',
    config.showScanlines ? '1' : '0',
    config.showScanlines === HUD_DEFAULTS.showScanlines
  )
  put('grid', config.showGrid ? '1' : '0', config.showGrid === HUD_DEFAULTS.showGrid)
  put(
    'readout',
    config.showTechReadout ? '1' : '0',
    config.showTechReadout === HUD_DEFAULTS.showTechReadout
  )
  put('demo', '1', !config.demo)

  return params.toString()
}
