'use client'

import Artwork from '../components/Artwork'
import { CornerMarks, formatTime, MicroLabel } from '../components/HudChrome'
import Visualizer from '../visualizers'
import { HudLayoutProps } from './types'

const SIZE = 260
/**
 * Sized so cover + waveform + text fit the square exactly:
 * 260 - 2px border - 28px padding = 230 usable, and 108 + 8 + 34 + 8 + 68 = 226.
 */
const ART_SIZE = 108
/** Fixed rather than per-visualizer: the square has no room to spare. */
const VIZ_HEIGHT = 34

/**
 * Square widget: cover on top, waveform band beneath it, then identity and
 * transport. Stacked rather than layered — a square cover centred over a
 * full-width visualizer would mask its middle and leave bars poking out either
 * side.
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
        gap: 8,
        padding: 14,
        background:
          'radial-gradient(circle at 50% 30%, rgba(8,12,17,0.9), rgba(6,10,14,0.62))',
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

      {config.showArtwork && (
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <Artwork
            url={track.artworkUrl}
            palette={palette}
            glow={config.glow * 0.6}
            size={ART_SIZE}
            isPlaying={state.isPlaying}
          />
        </div>
      )}

      <div
        style={{
          position: 'relative',
          width: '100%',
          height: VIZ_HEIGHT,
          flexShrink: 0,
          minHeight: 0,
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

      {/* Identity block pinned to the bottom. */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          marginTop: 'auto',
          textAlign: 'center',
          minWidth: 0,
        }}
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
