'use client'

import { formatUptime, LiveClock } from './UptimeClock'

type Props = {
  isLive: boolean
  uptimeSeconds: number | null
}

export default function HudHeader({ isLive, uptimeSeconds }: Props) {
  return (
    <div
      className='flex items-center justify-between'
      style={{
        height: 56,
        padding: '0 24px',
        gap: 16,
        background: 'rgba(0,255,135,0.03)',
        borderBottom: '1px solid rgba(0,255,135,0.16)',
      }}
    >
      <div className='flex items-center' style={{ gap: 12 }}>
        <div
          className='live-dot'
          style={{ opacity: isLive ? 1 : 0.3, background: isLive ? undefined : '#555' }}
        />
        <span
          className='font-spaceMono font-bold uppercase'
          style={{ fontSize: 13, letterSpacing: '0.2em', color: '#00FF87' }}
        >
          Chat.Monitor
        </span>
        <span
          className='font-spaceMono'
          style={{ fontSize: 10, letterSpacing: '0.15em', color: 'rgba(180,230,200,0.4)' }}
        >
          v2.0 · fullscreen
        </span>
      </div>

      <div className='flex items-center' style={{ gap: 28 }}>
        <div className='flex items-center' style={{ gap: 8 }}>
          <span
            className='font-spaceMono uppercase'
            style={{ fontSize: 9, letterSpacing: '0.2em', color: 'rgba(180,230,200,0.5)' }}
          >
            TPE
          </span>
          <span style={{ fontSize: 15, color: '#d4f5e2', letterSpacing: '0.1em' }}>
            <LiveClock />
          </span>
        </div>
        <div
          style={{
            width: 1,
            height: 16,
            background: 'rgba(0,255,135,0.2)',
          }}
        />
        <div className='flex items-center' style={{ gap: 8 }}>
          <span
            className='font-spaceMono uppercase'
            style={{ fontSize: 9, letterSpacing: '0.2em', color: 'rgba(180,230,200,0.5)' }}
          >
            Uptime
          </span>
          <span
            className='font-spaceMono'
            style={{ fontSize: 15, color: '#00FF87', letterSpacing: '0.1em' }}
          >
            {formatUptime(uptimeSeconds)}
          </span>
        </div>
      </div>
    </div>
  )
}
