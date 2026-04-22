'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useSpotifyNowPlaying } from '../hooks/useSpotifyNowPlaying'

function formatTime(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function SpotifyNowPlaying() {
  const { track } = useSpotifyNowPlaying()
  const active = track && track.isPlaying

  return (
    <AnimatePresence mode='wait' initial={false}>
      {active ? (
        <motion.div
          key={track.trackId}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          style={{
            padding: '20px 20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            borderTop: '1px solid rgba(0,255,135,0.12)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              className='font-spaceMono uppercase'
              style={{
                fontSize: 9,
                letterSpacing: '0.22em',
                color: 'rgba(180,230,200,0.5)',
              }}
            >
              Now Playing
            </span>
            <span
              className='font-spaceMono'
              style={{
                fontSize: 11,
                color: '#00FF87',
              }}
            >
              ♫
            </span>
          </div>

          <div
            className='font-spaceMono'
            style={{
              fontSize: 14,
              color: '#d4f5e2',
              fontWeight: 600,
              letterSpacing: '0.01em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={track.name}
          >
            {track.name}
          </div>

          <div
            className='font-spaceMono'
            style={{
              fontSize: 12,
              color: 'rgba(180,230,200,0.6)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              marginTop: -4,
            }}
            title={track.artists}
          >
            {track.artists}
          </div>

          {track.durationMs > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
              <div
                style={{
                  height: 3,
                  borderRadius: 2,
                  background: 'rgba(0,255,135,0.15)',
                  overflow: 'hidden',
                }}
              >
                <motion.div
                  animate={{
                    width: `${Math.min(100, (track.progressMs / track.durationMs) * 100)}%`,
                  }}
                  transition={{ duration: 0.9, ease: 'linear' }}
                  style={{
                    height: '100%',
                    background: '#00FF87',
                  }}
                />
              </div>
              <div
                className='font-spaceMono'
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 9,
                  letterSpacing: '0.15em',
                  color: 'rgba(180,230,200,0.4)',
                }}
              >
                <span>{formatTime(track.progressMs)}</span>
                <span>{formatTime(track.durationMs)}</span>
              </div>
            </div>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
