'use client'

import { getSongs } from '@/api/song'
import SongList from '@/components/chat/songList'
import { useEffect, useState } from 'react'

export default function Song() {
  const [songs, setSongs] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const res = await getSongs()
      setSongs(res.data)
    }

    const interval = setInterval(fetchData, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className='flex h-screen items-center' style={{ background: 'transparent' }}>
      <SongList songs={songs} />
    </div>
  )
}
