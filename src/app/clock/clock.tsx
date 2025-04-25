'use client'

import { Copy } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

type ClockStyle = 'all' | 'digital' | 'simple'

export default function Clock() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)
  const [copiedStyle, setCopiedStyle] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const style = (searchParams.get('style') as ClockStyle) || 'all'

  useEffect(() => {
    setMounted(true)

    const updateTime = () => {
      setCurrentTime(new Date())
    }

    updateTime()
    const intervalId = setInterval(updateTime, 1000)
    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    if (copiedStyle) {
      const timer = setTimeout(() => {
        setCopiedStyle(null)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [copiedStyle])

  const getRotation = (time: number, max: number) => (time / max) * 360
  const formatTime = (time: number) => (time < 10 ? `0${time}` : time)

  const now = currentTime || new Date()
  const hourRotation = getRotation(now.getHours() % 12, 12)
  const minuteRotation = getRotation(now.getMinutes(), 60)
  const secondRotation = getRotation(now.getSeconds(), 60)

  const daysOfWeek = ['SUN', 'MON', 'TUES', 'WED', 'THUR', 'FRI', 'SAT']
  const hour = now.getHours()
  const amPm = hour >= 12 ? 'PM' : 'AM'

  const copyToClipboard = (clockStyle: string) => {
    const url = `${window.location.origin}${window.location.pathname}?style=${clockStyle}`
    navigator.clipboard.writeText(url)
    setCopiedStyle(clockStyle)
  }

  const ClockCard = ({
    clockStyle,
    children,
  }: {
    clockStyle: string
    children: React.ReactNode
  }) => (
    <div className='border-2 border-gray-200 rounded-lg p-4 bg-white shadow-md flex flex-col relative'>
      <div className='flex justify-end items-center'>
        <button
          onClick={() => copyToClipboard(clockStyle)}
          className='text-gray-500 hover:text-gray-800 transition-colors'
          title='Copy link to this clock style'
        >
          {copiedStyle === clockStyle ? (
            <span className='text-xs text-green-500 font-poppins'>Copied!</span>
          ) : (
            <Copy size={18} />
          )}
        </button>
      </div>
      <div className='flex items-center py-2'>{children}</div>
    </div>
  )

  const renderDigitalClock = () => (
    <div className='flex font-poppins'>
      <div className='flex items-center rounded-3xl border-4 border-[#6b705c] bg-[#f9f7f3] bg-opacity-70 px-10 py-6 shadow-lg'>
        <div className='clock__circle relative w-20 h-20 rounded-full border-4 border-[#2f3e46] flex items-center justify-center'>
          <div className='clock__rounder absolute w-3 h-3 bg-[#2f3e46] rounded-full'></div>
          <div
            className='clock__hour absolute w-1.5 h-8 bg-[#2f3e46] rounded-full'
            style={{
              transform: `rotate(${hourRotation}deg)`,
              transformOrigin: 'bottom',
            }}
          ></div>
          <div
            className='clock__minutes absolute w-1 h-10 bg-[#2f3e46] rounded-full'
            style={{
              transform: `rotate(${minuteRotation}deg)`,
              transformOrigin: 'bottom',
            }}
          ></div>
          <div
            className='clock__seconds absolute w-0.5 h-12 bg-[#cb997e] rounded-full'
            style={{
              transform: `rotate(${secondRotation}deg)`,
              transformOrigin: 'bottom',
            }}
          ></div>
        </div>
        {currentTime && (
          <div className='ml-8'>
            <div className='flex items-center gap-3'>
              <p className='rounded-xl bg-[#ddbea9] px-3 py-1 text-2xl font-bold text-[#ffffff]'>
                {daysOfWeek[currentTime.getDay()]}
              </p>
              <p className='text-2xl font-bold text-slate-700'>
                {currentTime.getMonth() + 1}/{formatTime(currentTime.getDate())}
              </p>
            </div>
            <div className='time-font pt-2'>
              <p className='text-6xl font-bold text-[#2f3e46]'>
                {formatTime(hour % 12 || 12)}
                <span className='animate-pulse'> : </span>
                {formatTime(currentTime.getMinutes())}
                <span className='pl-2 text-2xl'>{amPm}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderSimpleClock = () => (
    <div className='font-poppins'>
      {currentTime && (
        <div className='flex w-96 relative'>
          <div className='flex gap-3 bg-[#2f3e46] px-4 py-2 text-center text-[#ddbea9] font-bold rounded-l-3xl rounded-r-3xl z-10'>
            <span>{daysOfWeek[currentTime.getDay()]}</span>
            <span className='text-white'>
              {currentTime.getMonth() + 1}/{currentTime.getDate()}
            </span>
          </div>
          <div className='flex gap-2 bg-[#E8EDF3] pr-4 pl-8 py-2 text-center text-[#2f3e46] font-bold rounded-r-3xl absolute left-24'>
            <span>
              {formatTime(hour % 12 || 12)}:{formatTime(currentTime.getMinutes())}
            </span>
            <span>{amPm}</span>
          </div>
        </div>
      )}
    </div>
  )

  const renderAllClock = () => (
    <div className='flex min-h-screen justify-center bg-gray-50 p-6'>
      <div className='w-full max-w-5xl'>
        {!mounted ? (
          // Render placeholder content during server rendering
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <div className='border-2 border-gray-200 rounded-lg p-4 bg-white shadow-md h-64 animate-pulse'></div>
            <div className='border-2 border-gray-200 rounded-lg p-4 bg-white shadow-md h-64 animate-pulse'></div>
          </div>
        ) : (
          // Render actual clocks after client-side hydration
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <ClockCard clockStyle='digital'>{renderDigitalClock()}</ClockCard>
            <ClockCard clockStyle='simple'>{renderSimpleClock()}</ClockCard>
          </div>
        )}
      </div>
    </div>
  )

  if (!mounted) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='bg-white p-6 rounded-lg shadow-md animate-pulse w-96 h-32'></div>
      </div>
    )
  }

  switch (style) {
    case 'digital':
      return renderDigitalClock()
    case 'simple':
      return renderSimpleClock()
    default:
      return renderAllClock()
  }
}
