'use client'

import { drawRadial, drawBars, drawWave } from './renderers'
import { VisualizerDraw, VisualizerProps } from './types'
import { smoothBars } from '@/lib/nowplaying/amplitude'
import { useEffect, useRef } from 'react'

type VisualizerEntry = {
  draw: VisualizerDraw
  label: string
  /**
   * Height the visualizer wants inside a layout. A radial needs vertical room
   * to read as a ring; bars and waves are happy in a thin band.
   */
  preferredHeight: number
}

export const VISUALIZERS: Record<string, VisualizerEntry> = {
  bars: { draw: drawBars, label: 'Bars', preferredHeight: 40 },
  wave: { draw: drawWave, label: 'Wave', preferredHeight: 44 },
  radial: { draw: drawRadial, label: 'Radial', preferredHeight: 92 },
}

export const VISUALIZER_IDS = Object.keys(VISUALIZERS)

export function visualizerHeight(id: string): number {
  return (VISUALIZERS[id] ?? VISUALIZERS.bars).preferredHeight
}

/** Idle amplitude retained while paused, so the HUD breathes instead of dying. */
const PAUSED_LEVEL = 0.12
const RISE = 0.35
const FALL = 0.12

/**
 * Canvas-based so a 60fps bar sweep doesn't force a DOM reflow every frame —
 * OBS browser sources are far more sensitive to that than a normal page.
 */
export default function Visualizer({
  source,
  positionMs,
  isPlaying,
  palette,
  config,
}: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Mutable mirrors, so the animation loop never has to be torn down and
  // rebuilt just because the position advanced.
  const positionRef = useRef(positionMs)
  const playingRef = useRef(isPlaying)
  const paletteRef = useRef(palette)
  const configRef = useRef(config)
  const sourceRef = useRef(source)

  positionRef.current = positionMs
  playingRef.current = isPlaying
  paletteRef.current = palette
  configRef.current = config
  sourceRef.current = source

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let frame = 0
    let lastDraw = 0
    let level = 0
    let barCount = configRef.current.barCount
    let bars = new Float32Array(barCount)
    let target = new Float32Array(barCount)

    // Backing store follows devicePixelRatio so the HUD stays crisp when OBS
    // renders the source at a higher scale.
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const rect = canvas.getBoundingClientRect()
      const w = Math.max(1, Math.round(rect.width))
      const h = Math.max(1, Math.round(rect.height))
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      return { w, h }
    }

    let size = resize()
    const observer = new ResizeObserver(() => {
      size = resize()
    })
    observer.observe(canvas)

    const loop = (time: number) => {
      frame = requestAnimationFrame(loop)

      // Don't burn CPU while the source is hidden in OBS.
      if (document.hidden) return

      const cfg = configRef.current
      const minInterval = 1000 / cfg.fps
      if (time - lastDraw < minInterval) return
      lastDraw = time

      if (cfg.barCount !== barCount) {
        barCount = cfg.barCount
        bars = new Float32Array(barCount)
        target = new Float32Array(barCount)
      }

      sourceRef.current.sample(positionRef.current, barCount, target)

      const wanted = playingRef.current ? 1 : PAUSED_LEVEL
      level += (wanted - level) * (wanted > level ? RISE : FALL)
      smoothBars(bars, target, level, RISE, FALL)

      ctx.clearRect(0, 0, size.w, size.h)
      const entry = VISUALIZERS[cfg.viz] ?? VISUALIZERS.bars
      entry.draw(ctx, {
        bars,
        width: size.w,
        height: size.h,
        palette: paletteRef.current,
        config: cfg,
        time,
      })
    }

    frame = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [])

  return (
    <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
  )
}
