'use client'

import { eventMotionProps } from '@/app/chat/components/eventMotion'
import { EventCardComponent } from '@/app/chat/components/twitchChat'
import { ChatMessage } from '@/app/chat/components/type'
import { AnimatePresence, motion } from 'framer-motion'

type Props = {
  events: ChatMessage[]
}

export default function EventsFeed({ events }: Props) {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid rgba(0,255,135,0.16)',
      }}
    >
      <div
        style={{
          padding: '18px 18px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span
          className='font-spaceMono uppercase'
          style={{
            fontSize: 9,
            letterSpacing: '0.22em',
            color: 'rgba(180,230,200,0.5)',
          }}
        >
          Events Feed
        </span>
        <div
          style={{
            flex: 1,
            height: 1,
            background: 'rgba(0,255,135,0.12)',
          }}
        />
        <span
          className='font-spaceMono'
          style={{ fontSize: 10, color: '#00FF87', letterSpacing: '0.1em' }}
        >
          {events.length}
        </span>
      </div>

      <div
        className='scrollbar-hide'
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 10px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {events.length === 0 ? (
          <div
            className='font-notoSans'
            style={{
              fontSize: 12,
              color: 'rgba(180,230,200,0.35)',
              padding: '12px 8px',
              textAlign: 'center',
            }}
          >
            等待訂閱、抖內、Raid...
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {events.map(ev => {
              const motionProps = eventMotionProps(ev)
              return (
                <motion.div
                  key={ev.id}
                  layout
                  initial={motionProps.initial}
                  animate={motionProps.animate}
                  exit={motionProps.exit}
                  transition={motionProps.transition}
                >
                  <EventCardComponent msg={ev} />
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
