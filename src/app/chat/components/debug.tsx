import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useState, useCallback } from 'react'

type SubTier = '1000' | '2000' | '3000'

const TwitchChatDebug = ({
  onSendMessage,
  onSimulateSub,
  onSimulateResub,
  onSimulateCheer,
  onSimulateGiftSub,
  onSimulateRaid,
  onSimulateFirstMessage,
  onSimulateHypeTrain,
}: {
  onSendMessage: (username: string, message: string) => void
  onSimulateSub: (username: string, months: number, message: string, tier: SubTier) => void
  onSimulateResub: (username: string, months: number, message: string, tier: SubTier) => void
  onSimulateCheer: (username: string, bits: number, message: string) => void
  onSimulateGiftSub: (gifter: string, count: number) => void
  onSimulateRaid: (username: string, viewers: number) => void
  onSimulateFirstMessage: (username: string, message: string) => void
  onSimulateHypeTrain?: (stage: 'begin' | 'progress' | 'end', level: number) => void
}) => {
  const [message, setMessage] = useState('')
  const [username, setUsername] = useState('TestUser')
  const [bits, setBits] = useState('1000')
  const [months, setMonths] = useState('3')
  const [giftCount, setGiftCount] = useState('5')
  const [raidViewers, setRaidViewers] = useState('150')
  const [tier, setTier] = useState<SubTier>('1000')

  const handleSendMessage = useCallback(() => {
    onSendMessage(username, message)
    setMessage('')
  }, [username, message, onSendMessage])

  const handleSimulateSub = useCallback(() => {
    onSimulateSub(username, parseInt(months), message, tier)
    setMessage('')
  }, [username, months, message, tier, onSimulateSub])

  const handleSimulateResub = useCallback(() => {
    onSimulateResub(username, parseInt(months), message, tier)
    setMessage('')
  }, [username, months, message, tier, onSimulateResub])

  const handleSimulateCheer = useCallback(() => {
    onSimulateCheer(username, parseInt(bits), message)
    setMessage('')
  }, [username, bits, message, onSimulateCheer])

  const handleSimulateGiftSub = useCallback(() => {
    onSimulateGiftSub(username, parseInt(giftCount))
  }, [username, giftCount, onSimulateGiftSub])

  const handleSimulateRaid = useCallback(() => {
    onSimulateRaid(username, parseInt(raidViewers))
  }, [username, raidViewers, onSimulateRaid])

  const handleSimulateFirstMessage = useCallback(() => {
    onSimulateFirstMessage(username, message)
    setMessage('')
  }, [username, message, onSimulateFirstMessage])

  return (
    <Card className='fixed top-4 right-4 w-[300px] z-50 max-h-[90vh] overflow-y-auto'>
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

        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label>贈送數量</Label>
            <Input
              type='number'
              value={giftCount}
              onChange={e => setGiftCount(e.target.value)}
              placeholder='贈送數量'
            />
          </div>
          <div className='space-y-2'>
            <Label>Raid 人數</Label>
            <Input
              type='number'
              value={raidViewers}
              onChange={e => setRaidViewers(e.target.value)}
              placeholder='人數'
            />
          </div>
        </div>

        <div className='space-y-2'>
          <Label>訂閱 Tier</Label>
          <div className='grid grid-cols-3 gap-2'>
            {(['1000', '2000', '3000'] as const).map(t => (
              <Button
                key={t}
                onClick={() => setTier(t)}
                variant={tier === t ? 'default' : 'outline'}
                size='sm'
              >
                T{t === '1000' ? 1 : t === '2000' ? 2 : 3}
              </Button>
            ))}
          </div>
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
          <Button onClick={handleSimulateResub} variant='outline'>
            模擬 Resub
          </Button>
          <Button onClick={handleSimulateGiftSub} variant='outline'>
            模擬批量禮訂
          </Button>
          <Button onClick={handleSimulateRaid} variant='outline'>
            模擬 Raid
          </Button>
          <Button onClick={handleSimulateFirstMessage} variant='outline'>
            模擬首次發言
          </Button>
          {onSimulateHypeTrain && (
            <>
              <Button onClick={() => onSimulateHypeTrain('begin', 1)} variant='outline'>
                發燒列車 開始
              </Button>
              <Button onClick={() => onSimulateHypeTrain('progress', 3)} variant='outline'>
                發燒列車 LV3
              </Button>
              <Button onClick={() => onSimulateHypeTrain('end', 5)} variant='outline'>
                發燒列車 結束
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default TwitchChatDebug
