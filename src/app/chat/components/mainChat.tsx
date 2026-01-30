'use client'

import TwitchChat from './twitchChat'
import { getStreams } from '@/api/twitch'
import TwitchChatListener from '@/lib/twitch'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { AiFillSmile } from 'react-icons/ai'
import { BsTwitterX, BsYoutube } from 'react-icons/bs'
import { GoPersonFill } from 'react-icons/go'
import ReactPlayer from 'react-player'

export default function MainChat() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [viewersCount, setViewersCount] = useState()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fadeClass, setFadeClass] = useState('')
  const [videoName, setVideoName] = useState('')
  const [playVideo, setPlayVideo] = useState(false)

  const socialMediaAccounts = [
    { icon: <BsTwitterX />, name: 'shushu010829', ifShow: true },
    { icon: <BsYoutube />, name: 'shushu0829', ifShow: true },
    { icon: <AiFillSmile />, name: '謝謝關注', ifShow: false },
  ]

  const handleVideoPlay = (name: string) => {
    setVideoName(name)
    setPlayVideo(true)
  }

  const handleVideoEnd = () => {
    setPlayVideo(false)
    setVideoName('')
  }

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date())
    }
    const intervalId = setInterval(updateTime, 1000)

    const fetchStreamData = async () => {
      const data = await getStreams()
      if (data.data[0]) {
        setViewersCount(data.data[0].viewer_count)
      }
    }
    fetchStreamData()
    const streamIntervalId = setInterval(fetchStreamData, 20000)

    return () => {
      clearInterval(intervalId)
      clearInterval(streamIntervalId)
    }
  }, [])

  useEffect(() => {
    const intervalId = setInterval(() => {
      setFadeClass('fadeOut')
      setTimeout(() => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % socialMediaAccounts.length)
        setFadeClass('')
      }, 1000)
    }, 5000)

    return () => clearInterval(intervalId)
  }, [socialMediaAccounts.length])

  const currentAccount = socialMediaAccounts[currentIndex]

  const formatTime = (time: number) => (time < 10 ? `0${time}` : time)
  const hour = currentTime.getHours()
  const daysOfWeek = ['週日', '週一', '週二', '週三', '週四', '週五', '週六']

  return (
    <div className='relative'>
      <div className='glass-card flex h-[720px] w-[360px] flex-col items-center rounded-3xl overflow-hidden'>
        {/* 頂部時間區塊 */}
        <div className='w-full pt-6 pb-4 px-6'>
          {/* 直播指示燈 */}
          <div className='flex justify-center mb-4'>
            <div className='glass-dark flex items-center gap-2 rounded-full px-4 py-1.5'>
              <div className='h-2 w-2 animate-fade-in-out rounded-full bg-red-400'></div>
              <span className='text-xs font-medium text-white/80'>LIVE</span>
            </div>
          </div>

          {/* 日期 */}
          <div className='flex items-center justify-center gap-2 mb-2'>
            <p className='font-notoSans text-lg font-medium text-white/90'>
              {currentTime.getMonth() + 1}月{currentTime.getDate()}日
            </p>
            <span className='text-white/50'>•</span>
            <p className='font-notoSans text-lg font-medium text-white/90'>
              {daysOfWeek[currentTime.getDay()]}
            </p>
          </div>

          {/* 時間 */}
          <div className='text-center font-titanOne'>
            <p className='text-6xl font-bold text-white drop-shadow-lg'>
              <span>{formatTime(hour)}</span>
              <span className='mx-1 opacity-70'>:</span>
              <span>{formatTime(currentTime.getMinutes())}</span>
            </p>
          </div>

          {/* 觀眾數 */}
          {viewersCount && (
            <div className='flex justify-center mt-3'>
              <div className='glass-tag flex items-center gap-2 rounded-full px-4 py-1'>
                <GoPersonFill className='text-slate-600' />
                <span className='font-notoSans text-sm font-semibold text-slate-700'>
                  {viewersCount}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 聊天區塊 */}
        <div className='flex-1 w-full px-4 pb-4'>
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
