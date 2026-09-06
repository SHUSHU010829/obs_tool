'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  CheckCircledIcon,
  CrossCircledIcon,
  ExclamationTriangleIcon,
} from '@radix-ui/react-icons'
import { toast } from 'sonner'

import { approveRequest, getPendingRequests, rejectRequest } from '@/api/songRequest'
import type { SongRequest } from '@/api/songRequest'

const POLL_INTERVAL_MS = 10_000

export default function SongRequests() {
  const [requests, setRequests] = useState<SongRequest[]>([])
  const [rejecting, setRejecting] = useState<SongRequest | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const fetchRequests = useCallback(async () => {
    try {
      const res = await getPendingRequests()
      setRequests(res.data || [])
    } catch (error) {
      toast.error('讀取點歌清單失敗', { description: (error as Error).message })
    }
  }, [])

  useEffect(() => {
    fetchRequests()
    const id = setInterval(fetchRequests, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [fetchRequests])

  const handleApprove = async (request: SongRequest) => {
    try {
      await approveRequest(request.id)
      await fetchRequests()
      toast.success('已接受點歌', {
        description: `${request.requester_display_name} - ${request.song_title}`,
      })
    } catch (error) {
      toast.error('接受失敗', { description: (error as Error).message })
    }
  }

  const openReject = (request: SongRequest) => {
    setRejecting(request)
    setRejectReason('')
  }

  const handleReject = async () => {
    if (!rejecting) return
    try {
      await rejectRequest(rejecting.id, rejectReason || undefined)
      await fetchRequests()
      toast('已拒絕點歌', {
        description: `${rejecting.requester_display_name} - ${rejecting.song_title}`,
      })
      setRejecting(null)
    } catch (error) {
      toast.error('拒絕失敗', { description: (error as Error).message })
    }
  }

  return (
    <div className='admin-card'>
      <div className='admin-card-header'>
        <div>
          <h3 className='admin-card-title'>待審點歌</h3>
          <p className='mt-1 text-xs text-[color:var(--admin-text-muted)]'>
            共 {requests.length} 筆待處理
          </p>
        </div>
      </div>

      <div className='admin-card-content'>
        {requests.length > 0 ? (
          <div className='flex flex-col gap-2'>
            {requests.map(request => (
              <div
                key={request.id}
                className='flex flex-col gap-3 rounded-[var(--admin-radius-sm)] border border-[color:var(--admin-border)] px-4 py-3 md:flex-row md:items-center md:justify-between'
              >
                <div className='min-w-0'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <span className='text-sm font-medium text-[color:var(--admin-text)]'>
                      {request.song_title}
                    </span>
                    {request.singer && (
                      <span className='text-xs text-[color:var(--admin-text-muted)]'>
                        {request.singer}
                      </span>
                    )}
                  </div>
                  <p className='mt-1 text-xs text-[color:var(--admin-text-subtle)]'>
                    @{request.requester_display_name} · {formatTime(request.create_time)}
                  </p>
                  {request.chat_drop_reason && (
                    <span className='admin-badge admin-badge--warn mt-2 inline-flex items-center gap-1'>
                      <ExclamationTriangleIcon className='h-3 w-3' />
                      通知失敗：{request.chat_drop_reason}
                    </span>
                  )}
                </div>
                <div className='flex shrink-0 gap-2'>
                  <button
                    onClick={() => handleApprove(request)}
                    className='admin-button admin-button-primary admin-button-sm'
                  >
                    <CheckCircledIcon className='h-4 w-4' />
                    接受
                  </button>
                  <button
                    onClick={() => openReject(request)}
                    className='admin-button admin-button-danger admin-button-sm'
                  >
                    <CrossCircledIcon className='h-4 w-4' />
                    拒絕
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center py-14 text-center'>
            <p className='text-sm text-[color:var(--admin-text-muted)]'>目前沒有待審核的點歌</p>
          </div>
        )}
      </div>

      <Dialog open={rejecting !== null} onOpenChange={open => !open && setRejecting(null)}>
        <DialogContent className='admin-shell admin-card border-[color:var(--admin-border-strong)] bg-[color:var(--admin-surface)] text-[color:var(--admin-text)] sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle className='text-base font-semibold'>拒絕點歌</DialogTitle>
          </DialogHeader>
          {rejecting && (
            <div className='grid gap-4 py-2'>
              <p className='text-sm text-[color:var(--admin-text-muted)]'>
                「{rejecting.song_title}」— @{rejecting.requester_display_name}
              </p>
              <div className='grid gap-2'>
                <label className='text-xs font-medium text-[color:var(--admin-text-muted)]'>
                  拒絕原因（選填）
                </label>
                <textarea
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  className='admin-textarea'
                  placeholder='會顯示給觀眾參考'
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <button onClick={handleReject} className='admin-button admin-button-primary'>
              確認拒絕
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('zh-TW', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
