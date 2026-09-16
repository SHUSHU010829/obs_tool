import { VisualizerDraw } from './types'

/** Symmetric vertical bars mirrored about the centre line. */
export const drawBars: VisualizerDraw = (
  ctx,
  { bars, width, height, palette, config }
) => {
  const n = bars.length
  const slot = width / n
  const barWidth = Math.max(1, slot * 0.55)
  const mid = height / 2

  ctx.shadowColor = palette.glow
  ctx.shadowBlur = 10 * config.glow

  for (let i = 0; i < n; i++) {
    const h = Math.max(1, bars[i] * (height / 2 - 2))
    const x = i * slot + (slot - barWidth) / 2

    const gradient = ctx.createLinearGradient(0, mid - h, 0, mid + h)
    gradient.addColorStop(0, palette.accent)
    gradient.addColorStop(0.5, palette.primary)
    gradient.addColorStop(1, palette.accent)
    ctx.fillStyle = gradient

    ctx.fillRect(x, mid - h, barWidth, h * 2)
  }

  ctx.shadowBlur = 0
}

/** Continuous mirrored waveform with a filled body. */
export const drawWave: VisualizerDraw = (
  ctx,
  { bars, width, height, palette, config }
) => {
  const n = bars.length
  const mid = height / 2
  const step = n === 1 ? width : width / (n - 1)

  const top: [number, number][] = []
  for (let i = 0; i < n; i++) {
    top.push([i * step, mid - bars[i] * (height / 2 - 2)])
  }

  ctx.beginPath()
  top.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
  for (let i = n - 1; i >= 0; i--) {
    ctx.lineTo(top[i][0], mid + (mid - top[i][1]))
  }
  ctx.closePath()

  const gradient = ctx.createLinearGradient(0, 0, width, 0)
  gradient.addColorStop(0, palette.primary)
  gradient.addColorStop(1, palette.accent)

  ctx.globalAlpha = 0.22
  ctx.fillStyle = gradient
  ctx.fill()

  ctx.globalAlpha = 1
  ctx.shadowColor = palette.glow
  ctx.shadowBlur = 12 * config.glow
  ctx.strokeStyle = gradient
  ctx.lineWidth = 1.6
  ctx.lineJoin = 'round'

  ctx.beginPath()
  top.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
  ctx.stroke()

  ctx.beginPath()
  top.forEach(([x, y], i) => {
    const my = mid + (mid - y)
    return i === 0 ? ctx.moveTo(x, my) : ctx.lineTo(x, my)
  })
  ctx.stroke()

  ctx.shadowBlur = 0
}

/** Radial spokes around a centre ring. */
export const drawRadial: VisualizerDraw = (
  ctx,
  { bars, width, height, palette, config, time }
) => {
  const n = bars.length
  const cx = width / 2
  const cy = height / 2
  const inner = Math.min(width, height) * 0.22
  const maxLen = Math.min(width, height) * 0.26
  const spin = (time / 1000) * 0.12 * config.speed

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(spin)

  ctx.strokeStyle = palette.dim
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(0, 0, inner, 0, Math.PI * 2)
  ctx.stroke()

  ctx.shadowColor = palette.glow
  ctx.shadowBlur = 8 * config.glow
  ctx.lineCap = 'round'

  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2
    const len = inner + bars[i] * maxLen
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)

    ctx.strokeStyle = i % 4 === 0 ? palette.accent : palette.primary
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(cos * inner, sin * inner)
    ctx.lineTo(cos * len, sin * len)
    ctx.stroke()
  }

  ctx.shadowBlur = 0
  ctx.restore()
}
