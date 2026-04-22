'use client'

import TwitchChat from '@/app/chat/components/twitchChat'
import { useEffect, useState } from 'react'
import EventsFeed from './components/EventsFeed'
import HudFooter from './components/HudFooter'
import HudHeader from './components/HudHeader'
import StatsPanel from './components/StatsPanel'
import TopChatters from './components/TopChatters'
import { useChatAggregates } from './hooks/useChatAggregates'
import { useStreamTelemetry } from './hooks/useStreamTelemetry'

const CHANNEL = 'shushu010829'
const CHANNEL_ID = '720691521'

export default function FullscreenChat() {
  const telemetry = useStreamTelemetry()
  const aggregates = useChatAggregates(telemetry.startedAt)
  const [debugMode, setDebugMode] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('obs-debug-mode')
    setDebugMode(stored === 'true')

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'obs-debug-mode') setDebugMode(e.newValue === 'true')
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return (
    <div
      className='fullscreen-chat'
      style={{
        height: '100vh',
        width: '100vw',
        background: 'rgba(10,20,14,0.95)',
        color: '#d4f5e2',
        display: 'grid',
        gridTemplateColumns: '280px 1fr 340px',
        gridTemplateRows: '56px 1fr 44px',
        overflow: 'hidden',
      }}
    >
      {/* Top HUD — spans full width */}
      <div style={{ gridColumn: '1 / -1' }}>
        <HudHeader isLive={telemetry.isLive} uptimeSeconds={telemetry.uptimeSeconds} />
      </div>

      {/* Left sidebar */}
      <div
        style={{
          borderRight: '1px solid rgba(0,255,135,0.16)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
        className='scrollbar-hide'
      >
        <StatsPanel
          currentViewers={telemetry.currentViewers}
          viewerHistory={telemetry.viewerHistory}
          msgPerMinute={aggregates.msgPerMinute}
          isLive={telemetry.isLive}
        />
        <TopChatters chatters={aggregates.topChatters} />
      </div>

      {/* Center: chat */}
      <div
        className='fullscreen-chat-center'
        style={{
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <TwitchChat
          channel={CHANNEL}
          channelId={CHANNEL_ID}
          hideAfter={Infinity}
          messagesLimit={40}
          debug={debugMode}
          onMessage={aggregates.push}
        />
      </div>

      {/* Right: events feed */}
      <div style={{ overflow: 'hidden' }}>
        <EventsFeed events={aggregates.recentEvents} />
      </div>

      {/* Bottom HUD — spans full width */}
      <div style={{ gridColumn: '1 / -1' }}>
        <HudFooter channel={CHANNEL} msgPerMinute={aggregates.msgPerMinute} />
      </div>
    </div>
  )
}
