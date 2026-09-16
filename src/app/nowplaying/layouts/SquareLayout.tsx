'use client'

import Artwork from '../components/Artwork'
import { CornerMarks, formatTime, MicroLabel } from '../components/HudChrome'
import Visualizer from '../visualizers'
import { HudLayoutProps } from './types'

const SIZE = 260
/**
 * Artwork sits inside the ring, so it must clear the visualizer's inner radius
 * (0.22 x the square's short side) or it masks the spokes.
 */
const ART_SIZE = 76

/**
 * Square widget built around the ring visualizer: the waveform encircles the
 * artwork rather than sitting beside it. Suits `viz=radial` best, but any
 * renderer works — they all just fill the square.
 */
export default function SquareLayout({
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
        width: SIZE,
        height: SIZE,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: 14,
        background:
          'radial-gradient(circle at 50% 42%, rgba(8,12,17,0.9), rgba(6,10,14,0.62))',
        border: `1px solid ${palette.dim}`,
        boxShadow: `0 0 ${30 * config.glow}px ${palette.glow}`,
      }}
    >
      {config.showGrid && (
        <span
          aria-hidden='true'
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(${palette.dim} 1px, transparent 1px), linear-gradient(90deg, ${palette.dim} 1px, transparent 1px)`,
            backgroundSize: '26px 26px',
            opacity: 0.3,
            pointerEvents: 'none',
          }}
        />
      )}

      <CornerMarks palette={palette} size={12} />

      {/* The visualizer is the backdrop; everything else sits on top of it. */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: SIZE - 62,
          pointerEvents: 'none',
        }}
      >
        <Visualizer
          source={source}
          positionMs={progressMs}
          isPlaying={state.isPlaying}
          palette={palette}
          config={config}
        />
      </div>

      {config.showArtwork && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: (SIZE - 62) / 2,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Artwork
            url={track.artworkUrl}
            palette={palette}
            glow={config.glow * 0.6}
            size={ART_SIZE}
            isPlaying={state.isPlaying}
            round
          />
        </div>
      )}

      {/* Identity block pinned to the bottom, clear of the ring. */}
      <div
        style={{ position: 'relative', width: '100%', textAlign: 'center', minWidth: 0 }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: palette.text,
            textShadow: `0 0 ${10 * config.glow}px ${palette.glow}`,
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
            marginTop: 2,
            fontSize: 11,
            color: palette.primary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={track.artists.join(' · ')}
        >
          {track.artists.join(' · ')}
        </div>

        <div
          style={{
            marginTop: 8,
            height: 2,
            background: palette.dim,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${ratio * 100}%`,
              background: palette.primary,
              boxShadow: `0 0 ${6 * config.glow}px ${palette.glow}`,
            }}
          />
        </div>

        <div
          style={{
            marginTop: 5,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <MicroLabel palette={palette} accent>
            {state.isPlaying ? '▶' : '❚❚'} {formatTime(progressMs)}
          </MicroLabel>
          <MicroLabel palette={palette}>{formatTime(track.durationMs)}</MicroLabel>
        </div>
      </div>
    </div>
  )
}
