'use client'

import { formatTime } from './HudChrome'
import { HudPalette } from '@/lib/nowplaying/palette'

type Props = {
  progressMs: number
  durationMs: number
  palette: HudPalette
  glow: number
}

/** Ticked progress rail with elapsed / remaining readouts. */
export default function ProgressBar({ progressMs, durationMs, palette, glow }: Props) {
  const ratio = durationMs > 0 ? Math.min(1, Math.max(0, progressMs / durationMs)) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div
        style={{
          position: 'relative',
          height: 4,
          background: palette.dim,
          overflow: 'hidden',
        }}
      >
        {/* Fixed tick marks read as a measuring scale rather than decoration. */}
        {[0.25, 0.5, 0.75].map(t => (
          <span
            key={t}
            style={{
              position: 'absolute',
              left: `${t * 100}%`,
              top: 0,
              bottom: 0,
              width: 1,
              background: palette.textMuted,
              opacity: 0.35,
            }}
          />
        ))}
        <div
          style={{
            height: '100%',
            width: `${ratio * 100}%`,
            background: palette.primary,
            boxShadow: `0 0 ${8 * glow}px ${palette.glow}`,
            // No CSS transition: the position is already interpolated per frame,
            // so animating here would add visible lag.
          }}
        />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 10,
          letterSpacing: '0.15em',
          color: palette.textMuted,
        }}
      >
        <span>{formatTime(progressMs)}</span>
        <span>{formatTime(durationMs)}</span>
      </div>
    </div>
  )
}
