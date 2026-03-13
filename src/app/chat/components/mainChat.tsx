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
      <div className='chat-container flex h-[680px] w-[360px] flex-col overflow-hidden'>
        {/* Header */}
        <div
          className='flex items-center border-b flex-shrink-0'
          style={{
            padding: '13px 16px',
            gap: 9,
            background: 'rgba(0,255,135,0.03)',
            borderColor: 'rgba(0,255,135,0.16)',
          }}
        >
          <div className='live-dot' />
          <span
            className='font-spaceMono font-bold uppercase'
            style={{ fontSize: '10.5px', letterSpacing: '0.13em', color: '#00FF87' }}
          >
            Chat
          </span>
          <span
            className='font-spaceMono'
            style={{ fontSize: 10, color: 'rgba(180,230,200,0.5)', marginLeft: 'auto' }}
          >
            shushu010829
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
