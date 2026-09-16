/**
 * The visualizer's data contract. Renderers only ever see this interface, so
 * the procedural generator and the real audio-analysis feed are hot-swappable
 * without any renderer knowing which one it is drawing.
 */
export type AmplitudeSource = {
  /** Fills `out` with `barCount` normalized 0..1 values for this position. */
  sample(positionMs: number, barCount: number, out: Float32Array): void
  readonly kind: 'procedural' | 'analysis'
}

/** mulberry32 — small, fast, and deterministic for a given seed. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashString(value: string): number {
  let h = 2166136261
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const OSC_COUNT = 5

/**
 * Procedural waveform. Seeding from the track id gives every song a stable,
 * distinctive character that looks identical on every reload, while remaining
 * completely independent of the actual audio (which the Web API cannot give us).
 */
export function createProceduralSource(trackId: string, speed = 1): AmplitudeSource {
  const rand = mulberry32(hashString(trackId))

  // Per-track oscillator bank: a few layered sine components at different
  // rates, plus a per-bar tilt so the shape isn't left/right symmetric.
  const osc = Array.from({ length: OSC_COUNT }, () => ({
    freq: 0.15 + rand() * 1.9,
    phase: rand() * Math.PI * 2,
    amp: 0.25 + rand() * 0.75,
    spatial: 0.5 + rand() * 4.5,
  }))
  const tilt = rand() * 0.6 - 0.3
  const noiseSeed = rand() * 1000

  return {
    kind: 'procedural',
    sample(positionMs, barCount, out) {
      const t = (positionMs / 1000) * speed

      for (let i = 0; i < barCount; i++) {
        const x = barCount === 1 ? 0.5 : i / (barCount - 1)

        let value = 0
        let ampTotal = 0
        for (const o of osc) {
          value +=
            o.amp * Math.sin(o.phase + t * o.freq * Math.PI * 2 + x * o.spatial * Math.PI)
          ampTotal += o.amp
        }
        value = value / ampTotal

        // Cheap deterministic jitter so bars shimmer instead of gliding.
        const n = Math.sin((x * 127.1 + noiseSeed + t * 3.7) * 43758.5453)
        value += (n - Math.floor(n) - 0.5) * 0.18

        // Envelope is symmetric about the centre: a one-sided spectrum falloff
        // leaves the right half of a wide HUD strip looking empty. The per-track
        // tilt keeps it from being perfectly mirrored.
        const centred = 1 - Math.abs(x - 0.5) * 2
        const shape = (0.45 + 0.55 * Math.pow(centred, 0.5)) * (1 + tilt * (x - 0.5))

        out[i] = Math.min(1, Math.max(0.02, (value * 0.5 + 0.5) * shape))
      }
    },
  }
}

export type AnalysisData = {
  loudness: number[]
  durationMs: number
}

/**
 * Real audio-analysis feed. Reads a window of the precomputed loudness curve
 * around the playhead so bars actually track the music.
 */
export function createAnalysisSource(analysis: AnalysisData): AmplitudeSource {
  const { loudness, durationMs } = analysis
  const n = loudness.length

  return {
    kind: 'analysis',
    sample(positionMs, barCount, out) {
      const head = Math.min(1, Math.max(0, positionMs / Math.max(1, durationMs)))
      // Bars fan out from the playhead across roughly 6s of the track.
      const spanFraction = Math.min(0.5, (6000 / Math.max(1, durationMs)) * barCount) / 2

      for (let i = 0; i < barCount; i++) {
        const x = barCount === 1 ? 0 : i / (barCount - 1)
        const at = head + (x - 0.5) * spanFraction * 2
        const idx = Math.min(n - 1, Math.max(0, Math.round(at * (n - 1))))
        // Emphasise the centre so the current moment reads loudest.
        const focus = 1 - Math.abs(x - 0.5) * 0.7
        out[i] = Math.min(1, Math.max(0.02, loudness[idx] * focus))
      }
    },
  }
}

/**
 * Smooths bar values frame to frame and folds in the play/paused level, so a
 * pause decays to a low idle breathing state rather than freezing dead.
 */
export function smoothBars(
  current: Float32Array,
  target: Float32Array,
  level: number,
  rise: number,
  fall: number
): void {
  for (let i = 0; i < current.length; i++) {
    const want = target[i] * level
    const rate = want > current[i] ? rise : fall
    current[i] += (want - current[i]) * rate
  }
}
