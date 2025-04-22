'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

type ClockStyle = 'analog' | 'digital' | 'simple'

export default function Clock() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const searchParams = useSearchParams()
  const style = (searchParams.get('style') as ClockStyle) || 'analog'

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date())
    }

    const intervalId = setInterval(updateTime, 1000)

    return () => clearInterval(intervalId)
  }, [])

  const getRotation = (time: number, max: number) => (time / max) * 360
  const formatTime = (time: number) => (time < 10 ? `0${time}` : time)

  const hourRotation = getRotation(currentTime.getHours() % 12, 12)
  const minuteRotation = getRotation(currentTime.getMinutes(), 60)
  const secondRotation = getRotation(currentTime.getSeconds(), 60)

  const daysOfWeek = ['SUN', 'MON', 'TUES', 'WED', 'THUR', 'FRI', 'SAT']
  const monthsOfYear = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  const hour = currentTime.getHours()
  const amPm = hour >= 12 ? 'PM' : 'AM'

  const renderAnalogClock = () => (
    <div className='flex h-screen items-center justify-center'>
      <div className='flex items-center rounded-3xl border-4 border-[#6b705c] bg-[#f9f7f3] bg-opacity-70 px-10 py-6 shadow-lg'>
        <div className='clock__circle'>
          <div className='clock__rounder'></div>
          <div
            className='clock__hour'
            style={{
              transform: `rotate(${hourRotation}deg)`,
              transformOrigin: 'bottom',
            }}
          ></div>
          <div
            className='clock__minutes'
            style={{
              transform: `rotate(${minuteRotation}deg)`,
              transformOrigin: 'bottom',
            }}
          ></div>
          <div
            className='clock__seconds'
            style={{
              transform: `rotate(${secondRotation}deg)`,
              transformOrigin: 'bottom',
            }}
          ></div>
        </div>

        <div className='ml-8'>
          <div className='flex items-center gap-3'>
            <p className='rounded-xl bg-[#ddbea9] px-3 py-1 text-2xl font-bold text-[#ffffff]'>
              {daysOfWeek[currentTime.getDay()]}
            </p>
            <p className='text-2xl font-bold text-slate-700'>
              {monthsOfYear[currentTime.getMonth()]} {formatTime(currentTime.getDate())}
            </p>
          </div>
          <div className='time-font pt-2'>
            <p className='text-6xl font-bold text-[#2f3e46]'>
              {formatTime(hour % 12 || 12)}
              <span className='animate-fade-in-out'> : </span>
              {formatTime(currentTime.getMinutes())}
              <span className='pl-2 text-2xl'>{amPm}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderDigitalClock = () => (
    <div className='flex'>
      <div className='rounded-3xl border-4 border-[#6b705c] bg-[#f9f7f3] bg-opacity-70 px-10 py-6 shadow-lg'>
        <div className='text-center'>
          <p className='text-8xl font-bold text-[#2f3e46]'>
            {formatTime(hour % 12 || 12)}
            <span className='animate-fade-in-out'> : </span>
            {formatTime(currentTime.getMinutes())}
            <span className='animate-fade-in-out'> : </span>
            {formatTime(currentTime.getSeconds())}
            <span className='pl-4 text-4xl'>{amPm}</span>
          </p>
          <p className='mt-4 text-2xl font-bold text-slate-700'>
            {daysOfWeek[currentTime.getDay()]}, {monthsOfYear[currentTime.getMonth()]}{' '}
            {formatTime(currentTime.getDate())}
          </p>
        </div>
      </div>
    </div>
  )

  const renderSimpleClock = () => (
    <div className='font-poppins'>
      <div className='flex w-96 relative'>
        <div className='flex gap-3 bg-[#2A2D3E] px-4 py-2 text-center text-[#FFB5B5] font-bold rounded-l-3xl rounded-r-3xl z-10'>
          <span>{daysOfWeek[currentTime.getDay()]}</span>
          <span className='text-white'>
            {currentTime.getMonth() + 1}/{currentTime.getDate()}
          </span>
        </div>
        <div className='flex gap-2 bg-[#E8EDF3] pr-4 pl-8 py-2 text-center text-[#2A2D3E] font-bold rounded-r-3xl absolute left-24'>
          <span>
            {formatTime(hour % 12 || 12)}:{formatTime(currentTime.getMinutes())}
          </span>
          <span>{amPm}</span>
        </div>
      </div>
    </div>
  )

  switch (style) {
    case 'digital':
      return renderDigitalClock()
    case 'simple':
      return renderSimpleClock()
    default:
      return renderAnalogClock()
  }
}
