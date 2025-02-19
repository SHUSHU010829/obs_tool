import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useState, useCallback } from 'react'

const TwitchChatDebug = ({
  onSendMessage,
  onSimulateSub,
  onSimulateCheer,
  onSimulateGiftSub,
}: {
  onSendMessage: (message: string) => void
  onSimulateSub: (username: string, months: number, message: string) => void
  onSimulateCheer: (username: string, bits: number, message: string) => void
  onSimulateGiftSub: (gifter: string, recipient: string) => void
}) => {
  const [message, setMessage] = useState('')
  const [username, setUsername] = useState('TestUser')
  const [bits, setBits] = useState('1000')
  const [months, setMonths] = useState('3')
  const [recipient, setRecipient] = useState('GiftRecipient')

  const handleSendMessage = useCallback(() => {
    onSendMessage(message)
    setMessage('')
  }, [message, onSendMessage])

  const handleSimulateSub = useCallback(() => {
    onSimulateSub(username, parseInt(months), message)
    setMessage('')
  }, [username, months, message, onSimulateSub])

  const handleSimulateCheer = useCallback(() => {
    onSimulateCheer(username, parseInt(bits), message)
    setMessage('')
  }, [username, bits, message, onSimulateCheer])

  const handleSimulateGiftSub = useCallback(() => {
    onSimulateGiftSub(username, recipient)
  }, [username, recipient, onSimulateGiftSub])

  return (
    <Card className='w-[300px] my-32'>
      <CardContent className='space-y-4 pt-4'>
        <div className='space-y-2'>
          <Label>使用者名稱</Label>
          <Input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder='輸入使用者名稱'
          />
        </div>

        <div className='space-y-2'>
          <Label>訊息</Label>
          <Input
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder='輸入訊息'
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label>bits 數量</Label>
            <Input
              type='number'
              value={bits}
              onChange={e => setBits(e.target.value)}
              placeholder='bits'
            />
          </div>
          <div className='space-y-2'>
            <Label>訂閱月數</Label>
            <Input
              type='number'
              value={months}
              onChange={e => setMonths(e.target.value)}
              placeholder='月數'
            />
          </div>
        </div>

        <div className='space-y-2'>
          <Label>禮物訂閱接收者</Label>
          <Input
            value={recipient}
            onChange={e => setRecipient(e.target.value)}
            placeholder='接收者名稱'
          />
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <Button onClick={handleSendMessage} variant='outline'>
            發送訊息
          </Button>
          <Button onClick={handleSimulateCheer} variant='outline'>
            模擬 Bits
          </Button>
          <Button onClick={handleSimulateSub} variant='outline'>
            模擬訂閱
          </Button>
          <Button onClick={handleSimulateGiftSub} variant='outline'>
            模擬禮物訂閱
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default TwitchChatDebug
