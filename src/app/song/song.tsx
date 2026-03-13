'use client'

import { SONG_LIST_STREAM_URL } from '@/api/song'
import SongList from '@/components/chat/songList'
import { useEffect, useState } from 'react'

export default function Song() {
  const [songs, setSongs] = useState([])

  useEffect(() => {
    const eventSource = new EventSource(SONG_LIST_STREAM_URL)

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setSongs(data)
      } catch (error) {
        console.error('[SSE] Failed to parse song data:', error)
      }
    }

    eventSource.onerror = () => {
      console.warn('[SSE] Connection error, will auto-reconnect...')
    }

    return () => eventSource.close()
  }, [])

  return (
    <div className='flex h-screen items-center' style={{ background: 'transparent' }}>
      <SongList songs={songs} />
    </div>
  )
}
