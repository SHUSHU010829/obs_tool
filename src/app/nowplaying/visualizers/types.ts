import { AmplitudeSource } from '@/lib/nowplaying/amplitude'
import { HudConfig } from '@/lib/nowplaying/config'
import { HudPalette } from '@/lib/nowplaying/palette'

/** What every visualizer receives. Note there is nothing Spotify-shaped here. */
export type VisualizerProps = {
  source: AmplitudeSource
  positionMs: number
  isPlaying: boolean
  palette: HudPalette
  config: HudConfig
}

/** Draws one frame into an already-sized 2D context. */
export type VisualizerDraw = (
  ctx: CanvasRenderingContext2D,
  frame: {
    bars: Float32Array
    width: number
    height: number
    palette: HudPalette
    config: HudConfig
    time: number
  }
) => void
