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

interface MsgProp {
  id: number
  create_time: string
  message: string
  reply_message: string | null
}

export default function MessageBoard() {
  const [msg, setMsg] = useState<MsgProp[]>()
  const [replyOpen, setReplyOpen] = useState(false)
  const [selectedMsg, setSelectedMsg] = useState<MsgProp | null>(null)
  const [replyText, setReplyText] = useState('')
  const [filter, setFilter] = useState<'all' | 'replied' | 'pending'>('all')

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
      setMsg(
        msg?.map(m =>
          m.id === selectedMsg.id ? { ...m, reply_message: replyText || null } : m
        )
      )
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
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="eink-card">
        <div className="eink-card-content py-4">
          <div className="grid grid-cols-3 gap-6">
            <div className="border-r border-[var(--eink-border-subtle)] pr-6">
              <p className="font-eink-sans text-3xl font-bold text-[var(--eink-text-primary)]">
                {msg?.length || 0}
              </p>
              <p className="mt-1 font-eink-serif text-sm text-[var(--eink-text-muted)]">
                總留言數
              </p>
            </div>
            <div className="border-r border-[var(--eink-border-subtle)] pr-6">
              <p className="font-eink-sans text-3xl font-bold text-[var(--eink-text-primary)]">
                {repliedCount}
              </p>
              <p className="mt-1 font-eink-serif text-sm text-[var(--eink-text-muted)]">
                已回覆
              </p>
            </div>
            <div>
              <p className="font-eink-sans text-3xl font-bold text-[var(--eink-text-primary)]">
                {pendingCount}
              </p>
              <p className="mt-1 font-eink-serif text-sm text-[var(--eink-text-muted)]">
                待回覆
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`eink-button ${filter === 'all' ? 'eink-button-primary' : ''}`}
        >
          全部 ({msg?.length || 0})
        </button>
        <button
          onClick={() => setFilter('replied')}
          className={`eink-button ${filter === 'replied' ? 'eink-button-primary' : ''}`}
        >
          已回覆 ({repliedCount})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`eink-button ${filter === 'pending' ? 'eink-button-primary' : ''}`}
        >
          待回覆 ({pendingCount})
        </button>
      </div>

      {/* Messages List */}
      <div className="eink-card">
        <div className="eink-card-header">
          <h3 className="eink-card-title">留言列表</h3>
          <p className="mt-1 font-eink-serif text-sm text-[var(--eink-text-muted)]">
            {filter === 'all' && '顯示所有留言'}
            {filter === 'replied' && '顯示已回覆的留言'}
            {filter === 'pending' && '顯示待回覆的留言'}
          </p>
        </div>

        <div className="eink-card-content">
          {filteredMessages && filteredMessages.length > 0 ? (
            <div className="flex flex-col gap-4">
              {filteredMessages.map(item => (
                <div
                  key={item.id}
                  className="eink-message-card transition-all duration-eink-fast ease-eink hover:border-[var(--eink-border-strong)]"
                >
                  {/* Message Header */}
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="eink-message-time">{formatDate(item.create_time)}</span>
                      {item.reply_message ? (
                        <span className="eink-badge eink-badge-active flex items-center gap-1">
                          <CheckCircledIcon className="h-3 w-3" />
                          已回覆
                        </span>
                      ) : (
                        <span className="eink-badge flex items-center gap-1">
                          <CrossCircledIcon className="h-3 w-3" />
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
                        <button
                          className="flex items-center gap-2 rounded-eink border border-[var(--eink-border-strong)] px-3 py-2 font-eink-sans text-sm transition-all duration-eink-fast ease-eink hover:bg-[var(--eink-text-primary)] hover:text-[var(--eink-bg-secondary)]"
                        >
                          <ChatBubbleIcon className="h-4 w-4" />
                          {item.reply_message ? '編輯回覆' : '回覆'}
                        </button>
                      </DialogTrigger>
                      <DialogContent className="eink-card border-[var(--eink-border-strong)] sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle className="font-eink-sans text-lg font-semibold">
                            回覆留言
                          </DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          {/* Original Message */}
                          <div className="rounded-eink border border-[var(--eink-border-subtle)] bg-[var(--eink-bg-primary)] p-4">
                            <p className="mb-2 font-eink-sans text-xs font-medium uppercase tracking-wider text-[var(--eink-text-muted)]">
                              原始留言
                            </p>
                            <p className="font-eink-serif text-[var(--eink-text-primary)]">
                              {selectedMsg?.message}
                            </p>
                            <p className="mt-2 font-eink-sans text-xs text-[var(--eink-text-muted)]">
                              {selectedMsg && formatDate(selectedMsg.create_time)}
                            </p>
                          </div>

                          {/* Reply Input */}
                          <div className="grid gap-2">
                            <label
                              htmlFor="reply"
                              className="font-eink-sans text-sm font-medium text-[var(--eink-text-secondary)]"
                            >
                              您的回覆
                            </label>
                            <textarea
                              id="reply"
                              value={replyText}
                              onChange={e => setReplyText(e.target.value)}
                              className="eink-input min-h-[120px] w-full resize-none"
                              placeholder="輸入回覆內容..."
                            />
                          </div>
                        </div>
                        <DialogFooter className="gap-2">
                          <button
                            onClick={() => {
                              setReplyText('')
                              setReplyOpen(false)
                            }}
                            className="eink-button"
                          >
                            取消
                          </button>
                          <button onClick={handleReply} className="eink-button eink-button-primary">
                            {selectedMsg?.reply_message ? '更新回覆' : '送出回覆'}
                          </button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Message Content */}
                  <div className="eink-message-content">{item.message}</div>

                  {/* Reply Section */}
                  {item.reply_message && (
                    <div className="eink-message-reply">
                      <p className="mb-1 font-eink-sans text-xs font-medium uppercase tracking-wider text-[var(--eink-text-muted)]">
                        回覆
                      </p>
                      <p>{item.reply_message}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ChatBubbleIcon className="mb-4 h-12 w-12 text-[var(--eink-text-muted)]" />
              <p className="font-eink-serif text-lg text-[var(--eink-text-muted)]">
                {filter === 'all' && '目前沒有留言'}
                {filter === 'replied' && '目前沒有已回覆的留言'}
                {filter === 'pending' && '太棒了！沒有待回覆的留言'}
              </p>
              <p className="mt-2 font-eink-serif text-sm text-[var(--eink-text-muted)]">
                {filter === 'pending'
                  ? '所有留言都已經回覆完畢'
                  : '留言將會在此顯示'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {filteredMessages && filteredMessages.length > 0 && (
          <div className="border-t border-[var(--eink-border-strong)] p-4">
            <p className="font-eink-serif text-sm text-[var(--eink-text-muted)]">
              顯示 {filteredMessages.length} 則留言
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
