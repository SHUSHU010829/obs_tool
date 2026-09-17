'use client'

import { MicroLabel } from './HudChrome'
import { HudPalette } from '@/lib/nowplaying/palette'
import { describeStatus, isFailureStatus } from '@/lib/nowplaying/types'
import type { SpotifyPlaybackState } from '@/lib/nowplaying/types'

type Props = {
  state: SpotifyPlaybackState
  palette: HudPalette
  glow: number
  /** Adds the status line. Off by default so it never appears on stream. */
  debug: boolean
}

/**
 * Shown in place of the HUD when there is no track. Lets the operator confirm
 * the browser source is alive and positioned while music is stopped — the
 * overlay is otherwise completely invisible, which looks identical to a
 * broken page.
 */
export default function StandbyHud({ state, palette, glow, debug }: Props) {
  const failed = isFailureStatus(state.status)
  const tone = failed ? '#ff5f56' : palette.primary

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 16px',
        background: 'rgba(6,10,14,0.55)',
        border: `1px solid ${palette.dim}`,
        boxShadow: `0 0 ${14 * glow}px ${palette.glow}`,
      }}
    >
      <span
        aria-hidden='true'
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: tone,
          boxShadow: `0 0 ${8 * glow}px ${tone}`,
          // Reuse the existing sidebar pulse rather than adding another keyframe.
          animation: 'fade 2s ease-in-out infinite',
        }}
      />
      <MicroLabel palette={palette} accent>
        {failed ? 'No Signal' : 'Standby'}
      </MicroLabel>

      {debug && (
        <span style={{ fontSize: 11, color: failed ? tone : palette.textMuted }}>
          {describeStatus(state)}
        </span>
      )}
    </div>
  )
}
