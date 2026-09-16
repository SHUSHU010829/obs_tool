import BarLayout from './BarLayout'
import MinimalLayout from './MinimalLayout'
import SquareLayout from './SquareLayout'
import TickerLayout from './TickerLayout'
import { HudLayoutProps } from './types'
import type { ComponentType } from 'react'

/**
 * Layout registry. Adding an entry here is all that is needed to expose a new
 * `?layout=` value — the Spotify data layer is untouched either way.
 */
export const LAYOUTS: Record<string, ComponentType<HudLayoutProps>> = {
  bar: BarLayout,
  minimal: MinimalLayout,
  ticker: TickerLayout,
  square: SquareLayout,
}

/** Labels + suggested OBS source size, surfaced by the admin studio. */
export const LAYOUT_META: Record<
  string,
  { label: string; width: number; height: number }
> = {
  bar: { label: 'Bar', width: 920, height: 200 },
  minimal: { label: 'Minimal', width: 560, height: 90 },
  ticker: { label: 'Ticker', width: 640, height: 44 },
  square: { label: 'Square', width: 260, height: 260 },
}

export const LAYOUT_IDS = Object.keys(LAYOUTS)

export type { HudLayoutProps }
