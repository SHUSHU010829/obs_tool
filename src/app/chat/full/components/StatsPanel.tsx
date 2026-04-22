'use client'

import { ReactNode } from 'react'
import Sparkline from './Sparkline'

type Props = {
  currentViewers: number | null
  viewerHistory: number[]
  msgPerMinute: number
  isLive: boolean
}

function StatLabel({ children }: { children: ReactNode }) {
  return (
    <span
      className='font-spaceMono uppercase'
      style={{
        fontSize: 9,
        letterSpacing: '0.22em',
        color: 'rgba(180,230,200,0.5)',
      }}
    >
      {children}
    </span>
  )
}

export default function StatsPanel({ currentViewers, viewerHistory, msgPerMinute, isLive }: Props) {
  const peak = viewerHistory.length > 0 ? Math.max(...viewerHistory) : null

  return (
    <div
      style={{
        padding: '20px 20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      <div>
        <StatLabel>Viewers</StatLabel>
        <div
          className='font-spaceMono'
          style={{
            fontSize: 42,
            lineHeight: 1,
            color: isLive ? '#00FF87' : 'rgba(180,230,200,0.4)',
            marginTop: 6,
            letterSpacing: '0.02em',
          }}
        >
          {currentViewers !== null ? currentViewers.toLocaleString() : '—'}
        </div>
        <div style={{ marginTop: 10 }}>
          <Sparkline data={viewerHistory} width={240} height={48} />
        </div>
        <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
          <span
            className='font-spaceMono'
            style={{ fontSize: 9, letterSpacing: '0.15em', color: 'rgba(180,230,200,0.4)' }}
          >
            PAST {viewerHistory.length} MIN
          </span>
          <span
            className='font-spaceMono'
            style={{ fontSize: 9, letterSpacing: '0.15em', color: 'rgba(180,230,200,0.4)' }}
          >
            PEAK {peak !== null ? peak.toLocaleString() : '—'}
          </span>
        </div>
      </div>

      <div
        style={{
          height: 1,
          background: 'rgba(0,255,135,0.12)',
        }}
      />

      <div>
        <StatLabel>Msg / Min</StatLabel>
        <div
          className='font-spaceMono'
          style={{
            fontSize: 32,
            lineHeight: 1,
            color: '#d4f5e2',
            marginTop: 6,
            letterSpacing: '0.02em',
          }}
        >
          {msgPerMinute}
        </div>
      </div>
    </div>
  )
}
