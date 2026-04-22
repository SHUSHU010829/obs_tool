'use client'

import { useEffect, useState } from 'react'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function formatUptime(seconds: number | null): string {
  if (seconds === null || seconds < 0) return '--:--:--'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

export function LiveClock() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!now) return <span className='font-spaceMono'>--:--:--</span>

  return (
    <span className='font-spaceMono'>
      {pad(now.getHours())}:{pad(now.getMinutes())}:{pad(now.getSeconds())}
    </span>
  )
}
