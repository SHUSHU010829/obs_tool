'use client'

import TwitchChat from './twitchChat'
import TwitchChatListener from '@/lib/twitch'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import ReactPlayer from 'react-player'

export default function MainChat() {
  const [videoName, setVideoName] = useState('')
  const [playVideo, setPlayVideo] = useState(false)

  const handleVideoPlay = (name: string) => {
    setVideoName(name)
    setPlayVideo(true)
  }

  const handleVideoEnd = () => {
    setPlayVideo(false)
    setVideoName('')
  }

  return (
    <div className='relative'>
      <div className='chat-container flex h-[680px] w-[360px] flex-col rounded-2xl overflow-hidden'>
        {/* Header */}
        <div className='flex items-center gap-2 px-4 py-3 border-b' style={{ borderColor: 'rgba(0,255,135,0.1)' }}>
          <div className='live-dot' />
          <span className='font-spaceMono text-sm font-bold' style={{ color: '#00FF87' }}>
            shushu010829
          </span>
          <span className='font-spaceMono text-xs' style={{ color: 'rgba(255,255,255,0.3)' }}>
            LIVE
          </span>
        </div>

        {/* Chat area */}
        <div className='flex-1 w-full'>
          <TwitchChat
            channel='shushu010829'
            channelId='720691521'
            hideAfter={Infinity}
            messagesLimit={15}
            debug={false}
          />
        </div>
      </div>
      <TwitchChatListener channelId='720691521' onPlay={handleVideoPlay} />

      <AnimatePresence>
        {playVideo && videoName && (
          <motion.div
            className='absolute bottom-0 left-0 w-full rounded-lg p-5 z-50'
            initial={{ y: '100%' }}
            animate={{ y: '0%' }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              stiffness: 100,
              damping: 20,
            }}
          >
            <div className='rounded-2xl overflow-hidden shadow-lg bg-black'>
              <div className='relative pt-[56.25%]'>
                <ReactPlayer
                  url={`/${videoName}`}
                  playing={true}
                  controls={true}
                  onEnded={handleVideoEnd}
                  width='100%'
                  height='100%'
                  className='absolute top-0 left-0'
                  style={{
                    borderRadius: '1rem',
                  }}
                  config={{
                    file: {
                      attributes: {
                        style: {
                          borderRadius: '1rem',
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
