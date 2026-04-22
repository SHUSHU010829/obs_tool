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
            {chatters.map((c, i) => {
              const isGold = i === 0
              const isSilver = i === 1
              const isBronze = i === 2
              const rowClass = isGold
                ? 'top-chatter-row--gold'
                : isSilver
                ? 'top-chatter-row--silver'
                : isBronze
                ? 'top-chatter-row--bronze'
                : ''

              const nameSize = isGold ? 16 : isSilver ? 14 : 13
              const countSize = isGold ? 15 : isSilver ? 13 : 12
              const rankSize = isGold ? 16 : 11
              const rowPadding = isGold ? '8px 10px' : '5px 8px'

              return (
                <motion.div
                  key={c.user.toLowerCase()}
                  className={rowClass}
                  layout
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: rowPadding,
                    borderLeft: rowClass ? undefined : '2px solid rgba(0,255,135,0.2)',
                  }}
                >
                  <span
                    className={`font-spaceMono${isGold ? ' top-chatter-crown' : ''}`}
                    style={{
                      fontSize: rankSize,
                      color: isGold
                        ? '#FFD166'
                        : isSilver
                        ? '#C7D5E0'
                        : isBronze
                        ? '#D9935B'
                        : 'rgba(180,230,200,0.5)',
                      minWidth: isGold ? 18 : 16,
                      textAlign: 'center',
                      lineHeight: 1,
                    }}
                  >
                    {isGold ? '♛' : String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className='font-spaceMono'
                    style={{
                      fontSize: nameSize,
                      color: c.color,
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontWeight: isGold ? 700 : isSilver || isBronze ? 600 : 400,
                      letterSpacing: isGold ? '0.02em' : undefined,
                      textShadow: isGold
                        ? '0 0 12px rgba(255, 209, 102, 0.45)'
                        : undefined,
                    }}
                  >
                    {c.user}
                  </span>
                  <span
                    className={`font-spaceMono${isGold ? ' top-chatter-count--gold' : ''}`}
                    style={{
                      fontSize: countSize,
                      color: isGold
                        ? '#FFD166'
                        : isSilver
                        ? '#E6EEF5'
                        : isBronze
                        ? '#F2C79E'
                        : '#d4f5e2',
                      letterSpacing: '0.05em',
                      fontWeight: isGold ? 700 : 500,
                    }}
                  >
                    {c.count}
                  </span>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
