'use client'

import TwitchChatListener from '@/lib/twitch'
import { useState } from 'react'
import ReactPlayer from 'react-player'

export default function Video() {
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
    <div>
      <TwitchChatListener channelId='720691521' onPlay={handleVideoPlay} />
      {playVideo && videoName && (
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
      )}
    </div>
  )
}
