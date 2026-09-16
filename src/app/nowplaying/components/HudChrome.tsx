'use client'

import { HudPalette } from '@/lib/nowplaying/palette'
import type { ReactNode } from 'react'

/** Corner ticks — the sci-fi framing device, drawn as four L-shaped brackets. */
export function CornerMarks({
  palette,
  size = 14,
}: {
  palette: HudPalette
  size?: number
}) {
  const corners = [
    { top: 0, left: 0, borderTop: true, borderLeft: true },
    { top: 0, right: 0, borderTop: true, borderRight: true },
    { bottom: 0, left: 0, borderBottom: true, borderLeft: true },
    { bottom: 0, right: 0, borderBottom: true, borderRight: true },
  ]

  return (
    <>
      {corners.map((c, i) => (
        <span
          key={i}
          aria-hidden='true'
          style={{
            position: 'absolute',
            width: size,
            height: size,
            top: c.top,
            left: c.left,
            right: c.right,
            bottom: c.bottom,
            borderTop: c.borderTop ? `1px solid ${palette.primary}` : undefined,
            borderBottom: c.borderBottom ? `1px solid ${palette.primary}` : undefined,
            borderLeft: c.borderLeft ? `1px solid ${palette.primary}` : undefined,
            borderRight: c.borderRight ? `1px solid ${palette.primary}` : undefined,
            pointerEvents: 'none',
          }}
        />
      ))}
    </>
  )
}

/** Tiny uppercase label, matching the existing /chat/full HUD idiom. */
export function MicroLabel({
  children,
  palette,
  accent = false,
}: {
  children: ReactNode
  palette: HudPalette
  accent?: boolean
}) {
  return (
    <span
      className='uppercase'
      style={{
        fontSize: 9,
        letterSpacing: '0.22em',
        color: accent ? palette.primary : palette.textMuted,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}

export function formatTime(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
