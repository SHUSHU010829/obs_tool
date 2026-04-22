'use client'

import NowWorking from './NowWorking'

type Props = {
  channel: string
  msgPerMinute: number
}

export default function HudFooter({ channel, msgPerMinute }: Props) {
  return (
    <div
      className='flex items-center'
      style={{
        height: 44,
        padding: '0 24px',
        gap: 20,
        background: 'rgba(0,255,135,0.03)',
        borderTop: '1px solid rgba(0,255,135,0.16)',
      }}
    >
      <div className='flex items-center' style={{ gap: 8, flexShrink: 0 }}>
        <span
          className='font-spaceMono'
          style={{ color: '#00FF87', fontSize: 13, letterSpacing: '0.08em' }}
        >
          &gt;
        </span>
        <span
          className='font-spaceMono'
          style={{
            color: '#d4f5e2',
            fontSize: 12,
            letterSpacing: '0.12em',
          }}
        >
          {channel}
        </span>
      </div>

      <div
        style={{
          width: 1,
          height: 16,
          background: 'rgba(0,255,135,0.2)',
          flexShrink: 0,
        }}
      />

      <NowWorking />

      <div
        style={{
          width: 1,
          height: 16,
          background: 'rgba(0,255,135,0.2)',
          flexShrink: 0,
        }}
      />

      <div className='flex items-center' style={{ gap: 8, flexShrink: 0 }}>
        <span
          className='font-spaceMono uppercase'
          style={{ fontSize: 9, letterSpacing: '0.2em', color: 'rgba(180,230,200,0.5)' }}
        >
          msg/min
        </span>
        <span
          className='font-spaceMono'
          style={{ fontSize: 13, color: '#00FF87', letterSpacing: '0.05em' }}
        >
          {String(msgPerMinute).padStart(3, '0')}
        </span>
      </div>
    </div>
  )
}
