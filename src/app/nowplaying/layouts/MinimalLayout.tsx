'use client'

import Artwork from '../components/Artwork'
import { formatTime, MicroLabel } from '../components/HudChrome'
import Visualizer from '../visualizers'
import { HudLayoutProps } from './types'

const ART_SIZE = 44

/**
 * Single-line variant for tucking into a corner. Same data, same visualizer —
 * only the arrangement differs, which is the point of the layout registry.
 */
export default function MinimalLayout({
  state,
  progressMs,
  palette,
  config,
  source,
}: HudLayoutProps) {
  const track = state.track
  if (!track) return null

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '10px 16px',
        background: 'rgba(6,10,14,0.72)',
        borderLeft: `2px solid ${palette.primary}`,
        boxShadow: `0 0 ${22 * config.glow}px ${palette.glow}`,
      }}
    >
      {config.showArtwork && (
        <Artwork
          url={track.artworkUrl}
          palette={palette}
          glow={config.glow}
          size={ART_SIZE}
          isPlaying={state.isPlaying}
        />
      )}

      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: palette.text,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={track.title}
        >
          {track.title}
        </div>
        <div
          style={{
            fontSize: 11,
            color: palette.primary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {track.artists.join(' · ')}
        </div>
      </div>

      <div style={{ width: 110, height: 26, flexShrink: 0 }}>
        <Visualizer
          source={source}
          positionMs={progressMs}
          isPlaying={state.isPlaying}
          palette={palette}
          config={config}
        />
      </div>

      <MicroLabel palette={palette} accent>
        {state.isPlaying ? formatTime(progressMs) : 'PAUSED'}
      </MicroLabel>
    </div>
  )
}
