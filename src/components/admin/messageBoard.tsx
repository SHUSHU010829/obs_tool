'use client'

import { getMsgBoard } from '@/api/messageBoard'
import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ChatBubbleIcon, CheckCircledIcon, CrossCircledIcon } from '@radix-ui/react-icons'
import { toast } from 'sonner'

interface MsgProp {
  id: number
  create_time: string
  message: string
  reply_message: string | null
}

type Filter = 'all' | 'replied' | 'pending'

export default function MessageBoard() {
  const [msg, setMsg] = useState<MsgProp[]>()
  const [replyOpen, setReplyOpen] = useState(false)
  const [selectedMsg, setSelectedMsg] = useState<MsgProp | null>(null)
  const [replyText, setReplyText] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    const fetchData = async () => {
      const msgData = await getMsgBoard()
      setMsg(msgData.data)
    }
    fetchData()
  }, [])

  const openReplyDialog = (message: MsgProp) => {
    setSelectedMsg(message)
    setReplyText(message.reply_message || '')
    setReplyOpen(true)
  }

  const handleReply = () => {
    // TODO: Implement API call to save reply
    if (selectedMsg) {
      const isUpdate = Boolean(selectedMsg.reply_message)
      setMsg(
        msg?.map(m =>
          m.id === selectedMsg.id ? { ...m, reply_message: replyText || null } : m
        )
      )
      toast.success(isUpdate ? '回覆已更新' : '回覆已送出')
    }
    setReplyOpen(false)
    setSelectedMsg(null)
    setReplyText('')
  }

  const filteredMessages = msg?.filter(item => {
    if (filter === 'replied') return item.reply_message !== null
    if (filter === 'pending') return item.reply_message === null
    return true
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  const repliedCount = msg?.filter(m => m.reply_message !== null).length || 0
  const pendingCount = msg?.filter(m => m.reply_message === null).length || 0

  return (
    <div className='space-y-5'>
      {/* Stats Row */}
      <div className='admin-card'>
        <div className='admin-card-content py-5'>
          <div className='grid grid-cols-3 gap-6'>
            <StatCell value={msg?.length || 0} label='總留言數' />
            <StatCell value={repliedCount} label='已回覆' tone='ok' />
            <StatCell value={pendingCount} label='待回覆' tone='warn' />
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className='admin-segmented'>
        <button
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'active' : ''}
        >
          全部 {msg?.length || 0}
        </button>
        <button
          onClick={() => setFilter('replied')}
          className={filter === 'replied' ? 'active' : ''}
        >
          已回覆 {repliedCount}
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={filter === 'pending' ? 'active' : ''}
        >
          待回覆 {pendingCount}
        </button>
      </div>

      {/* Messages List */}
      <div className='admin-card'>
        <div className='admin-card-header'>
          <div>
            <h3 className='admin-card-title'>留言列表</h3>
            <p className='mt-1 text-xs text-[color:var(--admin-text-muted)]'>
              {filter === 'all' && '顯示所有留言'}
              {filter === 'replied' && '顯示已回覆的留言'}
              {filter === 'pending' && '顯示待回覆的留言'}
            </p>
          </div>
          {filteredMessages && filteredMessages.length > 0 && (
            <span className='admin-badge'>{filteredMessages.length} 則</span>
          )}
        </div>

        <div className='admin-card-content'>
          {filteredMessages && filteredMessages.length > 0 ? (
            <div className='flex flex-col gap-3'>
              {filteredMessages.map(item => {
                const isReplied = Boolean(item.reply_message)
                return (
                  <div
                    key={item.id}
                    className={`admin-card admin-message-card ${
                      isReplied ? 'admin-message-card--replied' : 'admin-message-card--pending'
                    }`}
                    style={{ boxShadow: 'none' }}
                  >
                    <div className='admin-card-content'>
                      <div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
                        <div className='flex items-center gap-2'>
                          <span className='text-[11.5px] text-[color:var(--admin-text-subtle)]'>
                            {formatDate(item.create_time)}
                          </span>
                          {isReplied ? (
                            <span className='admin-badge admin-badge--ok'>
                              <CheckCircledIcon className='h-3 w-3' />
                              已回覆
                            </span>
                          ) : (
                            <span className='admin-badge admin-badge--warn'>
                              <CrossCircledIcon className='h-3 w-3' />
                              待回覆
                            </span>
                          )}
                        </div>
                        <Dialog
                          open={replyOpen && selectedMsg?.id === item.id}
                          onOpenChange={open => {
                            if (open) {
                              openReplyDialog(item)
                            } else {
                              setReplyOpen(false)
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <button className='admin-button admin-button-sm'>
                              <ChatBubbleIcon className='h-3.5 w-3.5' />
                              {isReplied ? '編輯回覆' : '回覆'}
                            </button>
                          </DialogTrigger>
                          <DialogContent className='admin-shell admin-card border-[color:var(--admin-border-strong)] bg-[color:var(--admin-surface)] text-[color:var(--admin-text)] sm:max-w-[500px]'>
                            <DialogHeader>
                              <DialogTitle className='text-base font-semibold'>
                                回覆留言
                              </DialogTitle>
                            </DialogHeader>
                            <div className='grid gap-4 py-2'>
                              <div className='rounded-[var(--admin-radius-sm)] border border-[color:var(--admin-border)] bg-[color:var(--admin-bg)] p-4'>
                                <p className='mb-2 text-[11px] font-medium uppercase tracking-wider text-[color:var(--admin-text-subtle)]'>
                                  原始留言
                                </p>
                                <p className='text-sm leading-relaxed text-[color:var(--admin-text)]'>
                                  {selectedMsg?.message}
                                </p>
                                <p className='mt-2 text-[11px] text-[color:var(--admin-text-subtle)]'>
                                  {selectedMsg && formatDate(selectedMsg.create_time)}
                                </p>
                              </div>

                              <div className='grid gap-2'>
                                <label
                                  htmlFor='reply'
                                  className='text-xs font-medium text-[color:var(--admin-text-muted)]'
                                >
                                  您的回覆
                                </label>
                                <textarea
                                  id='reply'
                                  value={replyText}
                                  onChange={e => setReplyText(e.target.value)}
                                  className='admin-textarea'
                                  placeholder='輸入回覆內容...'
                                />
                              </div>
                            </div>
                            <DialogFooter className='gap-2'>
                              <button
                                onClick={() => {
                                  setReplyText('')
                                  setReplyOpen(false)
                                }}
                                className='admin-button'
                              >
                                取消
                              </button>
                              <button
                                onClick={handleReply}
                                className='admin-button admin-button-primary'
                                disabled={!replyText.trim()}
                              >
                                {selectedMsg?.reply_message ? '更新回覆' : '送出回覆'}
                              </button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>

                      <div className='text-[15px] leading-relaxed text-[color:var(--admin-text)]'>
                        {item.message}
                      </div>

                      {item.reply_message && (
                        <div className='mt-3 border-t border-[color:var(--admin-border)] pt-3'>
                          <p className='mb-1 text-[11px] font-medium uppercase tracking-wider text-[color:var(--admin-state-ok)]'>
                            回覆
                          </p>
                          <p className='text-sm leading-relaxed text-[color:var(--admin-text-muted)]'>
                            {item.reply_message}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-14 text-center'>
              <ChatBubbleIcon className='mb-3 h-10 w-10 text-[color:var(--admin-text-subtle)]' />
              <p className='text-sm text-[color:var(--admin-text-muted)]'>
                {filter === 'all' && '目前沒有留言'}
                {filter === 'replied' && '目前沒有已回覆的留言'}
                {filter === 'pending' && '太棒了！沒有待回覆的留言'}
              </p>
              <p className='mt-1 text-xs text-[color:var(--admin-text-subtle)]'>
                {filter === 'pending' ? '所有留言都已經回覆完畢' : '留言將會在此顯示'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCell({
  value,
  label,
  tone,
}: {
  value: number
  label: string
  tone?: 'ok' | 'warn'
}) {
  const color =
    tone === 'ok'
      ? 'var(--admin-state-ok)'
      : tone === 'warn'
        ? 'var(--admin-state-warn)'
        : 'var(--admin-text)'
  return (
    <div className='border-r border-[color:var(--admin-border)] pr-6 last:border-r-0'>
      <p
        className='font-[family-name:var(--font-space-mono)] text-3xl font-bold'
        style={{ color }}
      >
        {value}
      </p>
      <p className='mt-1 text-xs text-[color:var(--admin-text-muted)]'>{label}</p>
    </div>
  )
}
