'use client'

import { useEffect, useCallback } from 'react'

interface VideoMap {
  [key: string]: string | string[]
}

const TwitchChatListener = ({
  channelId,
  onPlay,
}: {
  channelId: string
  onPlay: (videoName: string) => void
}) => {
  const pointVideoMap: VideoMap = {
    '888': ['ksp884.mp4', 'ksp8881.mp4', 'ksp88881.mp4'],
    退訂了: 'shuunSubscribe.mp4',
    TAT: 'kspCry.mp4',
    '0': 'seki01.mp4',
    好想姊姊: 'kspMiss.mp4',
    婆: 'kspWife2.mp4',
    早安: 'kspMorning1.mp4',
    睡屁睡: 'kspSleep1.mp4',
    LALALA: 'shushuLa.mp4',
    媽咪: 'sekiMommy.mp4',
    洗澡: 'kspBath1.mp4',
    '5MA': 'seki5ma1.mp4',
    蘑菇蘑菇: 'kspMogu1.mp4',
    HI: 'hiMary1.mp4',
    我是個廢物: 'kspDrink.mp4',
    哥哥: 'kspBrother.mp4',
    OMG: 'kspOmg.mp4',
  }

  const handleRewardRedemption = useCallback(
    (messageData: any) => {
      if (messageData.type === 'reward-redeemed') {
        const rewardTitle = messageData.data.redemption.reward.title
        let videoName = pointVideoMap[rewardTitle]

        if (Array.isArray(videoName)) {
          videoName = videoName[Math.floor(Math.random() * videoName.length)]
        }

        if (videoName && typeof videoName === 'string') {
          onPlay(videoName)
        }
      }
    },
    [onPlay, pointVideoMap]
  )

  useEffect(() => {
    const token = process.env.TWITCH_OAUTH_TOKEN
    let socket: WebSocket

    function connect() {
      socket = new WebSocket('wss://pubsub-edge.twitch.tv')

      socket.onopen = function () {
        socket.send(
          JSON.stringify({
            type: 'LISTEN',
            nonce: process.env.SOCKET_NONCE,
            data: {
              topics: [`channel-points-channel-v1.${channelId}`],
              auth_token: token,
            },
          })
        )

        // Send a heartbeat every 30 seconds
        const heartbeatInterval = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'PING' }))
          }
        }, 30000)

        // Clear interval when socket closes
        socket.onclose = () => {
          clearInterval(heartbeatInterval)
          setTimeout(connect, 5000)
        }
      }

      socket.onmessage = function (event) {
        const message = JSON.parse(event.data)
        if (message.type === 'MESSAGE') {
          const messageData = JSON.parse(message.data.message)
          handleRewardRedemption(messageData)
        }
      }
    }

    connect()

    return () => {
      socket?.close()
    }
  }, [channelId, handleRewardRedemption])

  return null
}

export default TwitchChatListener
