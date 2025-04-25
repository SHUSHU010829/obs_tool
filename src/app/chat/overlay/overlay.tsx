'use client'

import { Copy } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import tmi from 'tmi.js'

type ClockStyle = 'all' | 'simple'

export default function Overlay() {
  const [mounted, setMounted] = useState(false)
  const [copiedStyle, setCopiedStyle] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const style = (searchParams.get('style') as ClockStyle) || 'all'
  const clientRef = useRef<tmi.Client | null>(null)
  const processedMessageIds = useRef(new Set<string>())

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (copiedStyle) {
      const timer = setTimeout(() => {
        setCopiedStyle(null)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [copiedStyle])

  useEffect(() => {
    // 確保只創建一個 client 實例
    if (clientRef.current) {
      clientRef.current.disconnect()
    }

    const client = new tmi.Client({
      channels: [process.env.TWITCH_CHANNEL_NAME || ''],
    })
    console.log(client)

    clientRef.current = client

    client.connect().catch(console.error)

    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect()
        clientRef.current = null
      }
      processedMessageIds.current.clear()
    }
  }, [])

  const copyToClipboard = (clockStyle: string) => {
    const url = `${window.location.origin}${window.location.pathname}?style=${clockStyle}`
    navigator.clipboard.writeText(url)
    setCopiedStyle(clockStyle)
  }

  const OverlayCard = ({
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

  const renderSimpleOverlay = () => <></>

  const renderAllOverlay = () => (
    <div className='flex min-h-screen justify-center bg-gray-50 p-6'>
      <div className='w-full max-w-5xl'>
        {!mounted ? (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <div className='border-2 border-gray-200 rounded-lg p-4 bg-white shadow-md h-64 animate-pulse'></div>
            <div className='border-2 border-gray-200 rounded-lg p-4 bg-white shadow-md h-64 animate-pulse'></div>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <OverlayCard clockStyle='simple'>{renderSimpleOverlay()}</OverlayCard>
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
    case 'simple':
      return renderSimpleOverlay()
    default:
      return renderAllOverlay()
  }
}
