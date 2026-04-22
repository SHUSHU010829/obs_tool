'use client'

import { TopChatter } from '../hooks/useChatAggregates'
import { AnimatePresence, motion } from 'framer-motion'

type Props = {
  chatters: TopChatter[]
}

export default function TopChatters({ chatters }: Props) {
  return (
    <div
      style={{
        padding: '20px 20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        borderTop: '1px solid rgba(0,255,135,0.12)',
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
        Top Chatters
      </span>

      {chatters.length === 0 ? (
        <div
          className='font-notoSans'
          style={{
            fontSize: 12,
            color: 'rgba(180,230,200,0.35)',
            padding: '8px 0',
          }}
        >
          等待第一則訊息...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <AnimatePresence initial={false}>
            {chatters.map((c, i) => (
              <motion.div
                key={c.user.toLowerCase()}
                layout
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '5px 8px',
                  background: i === 0 ? 'rgba(0,255,135,0.05)' : 'transparent',
                  borderLeft: `2px solid ${i === 0 ? '#00FF87' : 'rgba(0,255,135,0.2)'}`,
                }}
              >
                <span
                  className='font-spaceMono'
                  style={{
                    fontSize: 10,
                    color: 'rgba(180,230,200,0.5)',
                    minWidth: 14,
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className='font-spaceMono'
                  style={{
                    fontSize: 12,
                    color: c.color,
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {c.user}
                </span>
                <span
                  className='font-spaceMono'
                  style={{
                    fontSize: 11,
                    color: '#d4f5e2',
                    letterSpacing: '0.05em',
                  }}
                >
                  {c.count}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
