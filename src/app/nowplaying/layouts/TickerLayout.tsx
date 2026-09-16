'use client'

import Artwork from '../components/Artwork'
import { formatTime, MicroLabel } from '../components/HudChrome'
import Visualizer from '../visualizers'
import { HudLayoutProps } from './types'

const ART_SIZE = 26

/**
 * Everything on one line: state, title, artist, waveform, clock. The most
 * space-frugal variant — meant for a thin strip along a screen edge.
 */
export default function TickerLayout({
  state,
  progressMs,
  palette,
  config,
  source,
}: HudLayoutProps) {
  const track = state.track
  if (!track) return null

  const ratio = track.durationMs > 0 ? Math.min(1, progressMs / track.durationMs) : 0

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 14px',
        height: 40,
        whiteSpace: 'nowrap',
        background: 'rgba(6,10,14,0.66)',
        border: `1px solid ${palette.dim}`,
        boxShadow: `0 0 ${16 * config.glow}px ${palette.glow}`,
      }}
    >
      {/* Progress reads as a hairline under the whole strip — no separate row. */}
      <span
        aria-hidden='true'
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          height: 2,
          width: `${ratio * 100}%`,
          background: palette.primary,
          boxShadow: `0 0 ${6 * config.glow}px ${palette.glow}`,
        }}
      />

      {config.showArtwork && (
        <Artwork
          url={track.artworkUrl}
          palette={palette}
          glow={config.glow * 0.5}
          size={ART_SIZE}
          isPlaying={state.isPlaying}
        />
      )}

      <MicroLabel palette={palette} accent>
        {state.isPlaying ? '▶' : '❚❚'}
      </MicroLabel>

      <span
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: palette.text,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          minWidth: 0,
        }}
        title={track.title}
      >
        {track.title}
      </span>

      <span style={{ fontSize: 12, color: palette.dim }}>—</span>

      <span
        style={{
          fontSize: 12,
          color: palette.primary,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          minWidth: 0,
          flex: 1,
        }}
        title={track.artists.join(' · ')}
      >
        {track.artists.join(' · ')}
      </span>

      <div style={{ width: 84, height: 18, flexShrink: 0 }}>
        <Visualizer
          source={source}
          positionMs={progressMs}
          isPlaying={state.isPlaying}
          palette={palette}
          config={config}
        />
      </div>

      <MicroLabel palette={palette}>
        {formatTime(progressMs)} / {formatTime(track.durationMs)}
      </MicroLabel>
    </div>
  )
}
