'use client'

import StandbyHud from './components/StandbyHud'
import { LAYOUT_IDS, LAYOUTS } from './layouts'
import { VISUALIZER_IDS } from './visualizers'
import {
  AmplitudeSource,
  createAnalysisSource,
  createProceduralSource,
} from '@/lib/nowplaying/amplitude'
import { fontClassName, parseHudConfig } from '@/lib/nowplaying/config'
import { useArtworkPalette } from '@/lib/nowplaying/palette'
import { usePlaybackSync } from '@/lib/nowplaying/playback'
import { isFailureStatus } from '@/lib/nowplaying/types'
import { AnimatePresence, motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

/**
 * The seam between the two layers: `usePlaybackSync` produces normalized state,
 * everything below consumes it. No layout or visualizer talks to Spotify.
 */
export default function NowPlaying() {
  const searchParams = useSearchParams()

  const config = useMemo(
    () =>
      parseHudConfig(new URLSearchParams(searchParams.toString()), {
        layouts: LAYOUT_IDS,
        visualizers: VISUALIZER_IDS,
      }),
    [searchParams]
  )

  const { state, progressMs, trackKey } = usePlaybackSync({ demo: config.demo })
  const palette = useArtworkPalette(state.track?.artworkUrl ?? null, config.color)

  // Start procedural (always available), then upgrade in place if Spotify's
  // audio analysis turns out to be reachable for this app.
  const [analysisSource, setAnalysisSource] = useState<AmplitudeSource | null>(null)

  const proceduralSource = useMemo(
    () => createProceduralSource(trackKey, config.speed),
    [trackKey, config.speed]
  )

  useEffect(() => {
    setAnalysisSource(null)
    const id = state.track?.id
    if (!id || config.demo) return

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/spotify/analysis/${encodeURIComponent(id)}`, {
          cache: 'force-cache',
        })
        if (!res.ok) return
        const data = await res.json()
        if (cancelled || !data?.available) return
        setAnalysisSource(createAnalysisSource(data))
      } catch {
        // Expected for apps without audio-analysis access — stay procedural.
      }
    })()

    return () => {
      cancelled = true
    }
  }, [state.track?.id, config.demo])

  // globals.css gives body a light background for the admin theme. OBS injects
  // its own transparent-body CSS, but relying on that would make the overlay
  // break anywhere else (browser preview, the admin studio iframe).
  useEffect(() => {
    const { body, documentElement } = document
    const prev = {
      background: body.style.background,
      margin: body.style.margin,
      overflow: body.style.overflow,
      htmlBackground: documentElement.style.background,
    }

    body.style.background = 'transparent'
    body.style.margin = '0'
    body.style.overflow = 'hidden'
    documentElement.style.background = 'transparent'

    return () => {
      body.style.background = prev.background
      body.style.margin = prev.margin
      body.style.overflow = prev.overflow
      documentElement.style.background = prev.htmlBackground
    }
  }, [])

  const Layout = LAYOUTS[config.layout] ?? LAYOUTS.bar
  const hasTrack = state.isActive && state.track !== null

  /**
   * Three states rather than two. Hiding on every non-playing condition made a
   * credential failure look exactly like a paused Spotify — `standby`/`debug`
   * make the difference visible without putting anything on stream by default.
   */
  const mode: 'hud' | 'standby' | 'hidden' = hasTrack
    ? 'hud'
    : config.standby || (config.debug && isFailureStatus(state.status))
      ? 'standby'
      : 'hidden'

  return (
    <main
      className={fontClassName(config.font)}
      style={{
        background: 'transparent',
        display: 'flex',
        alignItems: 'flex-start',
        padding: 0,
        margin: 0,
        overflow: 'hidden',
        // Browser sources should never intercept clicks.
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence mode='wait' initial={false}>
        {mode !== 'hidden' && (
          <motion.div
            key={mode === 'hud' ? trackKey : 'standby'}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: config.opacity, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{ width: '100%' }}
          >
            {mode === 'hud' ? (
              <Layout
                state={state}
                progressMs={progressMs}
                palette={palette}
                config={config}
                source={analysisSource ?? proceduralSource}
              />
            ) : (
              <StandbyHud
                state={state}
                palette={palette}
                glow={config.glow}
                debug={config.debug}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
