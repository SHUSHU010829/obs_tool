'use client'

import { getStreams } from '@/api/twitch'
import TwitchChatListener from '@/lib/twitch'
import { motion, AnimatePresence } from 'framer-motion'
import { SetStateAction, useEffect, useState } from 'react'
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

  const handleVideoPlay = (name: SetStateAction<string>) => {
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
      <div className='flex h-[780px] w-[380px] flex-col items-center rounded-3xl border-4 border-[#6b705c] bg-[#f9f7f3] bg-opacity-70 shadow-lg'>
        <div className='my-3 flex w-32 items-center justify-between rounded-full bg-neutral-700 px-4 py-1'>
          <div className='h-2 w-2 my-1 animate-fade-in-out rounded-full bg-red-500'></div>
        </div>
        <div className='flex flex-col items-center justify-start pt-2'>
          <div className='flex items-center gap-2'>
            <p className='font-notoSans text-xl font-semibold text-slate-700'>
              {currentTime.getMonth() + 1}月{currentTime.getDate()}日
            </p>
            <p className='font-notoSans text-xl font-semibold text-slate-700'>
              {daysOfWeek[currentTime.getDay()]}
            </p>
          </div>
          <div className='pt-1 font-titanOne'>
            <p className='text-6xl font-bold text-[#2f3e46]'>
              <span>{formatTime(hour)}</span>
              <span> : </span>
              <span>{formatTime(currentTime.getMinutes())}</span>
            </p>
          </div>
          <div className='flex justify-between gap-2 pt-2'>
            <div className='flex w-24 items-center justify-center font-notoSans text-xl font-semibold text-[#6b705c] pt-1'>
              {viewersCount ? (
                <div className='flex items-center gap-2'>
                  <GoPersonFill />
                  {viewersCount}
                </div>
              ) : (
                <div>讀取中</div>
              )}
            </div>
            <div className='flex w-48 items-center justify-center font-notoSans text-xl font-semibold text-[#6b705c]'>
              <div className={`account flex items-center gap-3 ${fadeClass}`}>
                <div className='mt-1'>{currentAccount.icon}</div>
                <div className='flex items-center gap-1 text-lg'>
                  {currentAccount.ifShow && (
                    <span className='text-base text-[#E87D35]'>@</span>
                  )}
                  {currentAccount.name}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TwitchChatListener channelId='720691521' onPlay={handleVideoPlay} />

      <AnimatePresence>
        {playVideo && videoName && (
          <motion.div
            className='absolute bottom-0 left-0 w-full'
            initial={{ y: '100%' }}
            animate={{ y: '0%' }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              stiffness: 100,
              damping: 20,
            }}
          >
            <ReactPlayer
              url={`/${videoName}`}
              playing={true}
              controls={true}
              onEnded={handleVideoEnd}
              width='100%'
              height='100%'
              config={{
                file: {
                  attributes: {
                    autoPlay: true,
                  },
                },
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
