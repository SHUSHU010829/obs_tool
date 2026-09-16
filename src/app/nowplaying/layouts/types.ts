import { SpotifyPlaybackState } from '@/api/spotify'
import { AmplitudeSource } from '@/lib/nowplaying/amplitude'
import { HudConfig } from '@/lib/nowplaying/config'
import { HudPalette } from '@/lib/nowplaying/palette'

/**
 * What every layout receives. A layout arranges and styles; it never fetches.
 * Swapping the data source upstream requires no change here.
 */
export type HudLayoutProps = {
  state: SpotifyPlaybackState
  progressMs: number
  palette: HudPalette
  config: HudConfig
  source: AmplitudeSource
}
