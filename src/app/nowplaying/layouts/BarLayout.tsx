'use client'

import Artwork from '../components/Artwork'
import { CornerMarks, MicroLabel } from '../components/HudChrome'
import ProgressBar from '../components/ProgressBar'
import Visualizer, { visualizerHeight } from '../visualizers'
import { HudLayoutProps } from './types'

const ART_SIZE = 132

/**
 * Horizontal strip HUD: artwork on the left, identity + waveform + transport
 * on the right. Sized for roughly 900x260 as an OBS browser source.
 */
export default function BarLayout({
  state,
  progressMs,
  palette,
  config,
  source,
}: HudLayoutProps) {
  const track = state.track
  if (!track) return null

  const artists = track.artists.join(' · ')

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        gap: 20,
        padding: 18,
        // Centre rather than stretch, so the cover sits level with the text
        // column instead of riding up against the top edge.
        alignItems: 'center',
        background: 'linear-gradient(115deg, rgba(6,10,14,0.82), rgba(6,10,14,0.55))',
        border: `1px solid ${palette.dim}`,
        boxShadow: `0 0 ${34 * config.glow}px ${palette.glow}, inset 0 0 ${40 * config.glow}px rgba(0,0,0,0.5)`,
      }}
    >
      {/* Colour bloom behind the whole panel, keyed to the artwork hue. */}
      <span
        aria-hidden='true'
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(120% 140% at 12% 50%, ${palette.glow}, transparent 62%)`,
          opacity: 0.4 * config.glow,
          pointerEvents: 'none',
        }}
      />

      {config.showGrid && (
        <span
          aria-hidden='true'
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(${palette.dim} 1px, transparent 1px), linear-gradient(90deg, ${palette.dim} 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
            opacity: 0.35,
            pointerEvents: 'none',
          }}
        />
      )}

      <CornerMarks palette={palette} />

      {config.showArtwork && (
        <Artwork
          url={track.artworkUrl}
          palette={palette}
          glow={config.glow}
          size={ART_SIZE}
          isPlaying={state.isPlaying}
        />
      )}

      <div
        style={{
          position: 'relative',
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <MicroLabel palette={palette} accent>
          {state.isPlaying ? '▶ Playing' : '❚❚ Paused'}
        </MicroLabel>

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              lineHeight: 1.1,
              color: palette.text,
              textShadow: `0 0 ${14 * config.glow}px ${palette.glow}`,
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
              marginTop: 3,
              fontSize: 13,
              letterSpacing: '0.08em',
              color: palette.primary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={artists}
          >
            {artists}
          </div>
        </div>

        <div style={{ height: visualizerHeight(config.viz), minHeight: 0 }}>
          <Visualizer
            source={source}
            positionMs={progressMs}
            isPlaying={state.isPlaying}
            palette={palette}
            config={config}
          />
        </div>

        <ProgressBar
          progressMs={progressMs}
          durationMs={track.durationMs}
          palette={palette}
          glow={config.glow}
        />
      </div>

      {config.showScanlines && (
        <span
          aria-hidden='true'
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 1px, transparent 1px, transparent 3px)',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  )
}
