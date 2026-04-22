'use client'

import { ReactNode, useCallback, useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  TrashIcon,
  ResetIcon,
  ArchiveIcon,
  CounterClockwiseClockIcon,
} from '@radix-ui/react-icons'
import {
  getHistorySongs,
  restoreSong,
  hardDeleteSong,
  hardDeleteAllSongs,
} from '@/api/song'
import { toast } from 'sonner'

interface HistorySong {
  id: number
  song_title: string
  singer: string
  now_playing: number
  status: number
  sort_order: number
  created_at?: string
}

export default function SongBook() {
  const [historySongs, setHistorySongs] = useState<HistorySong[]>([])
  const [selectedSong, setSelectedSong] = useState<HistorySong | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const fetchHistory = useCallback(async () => {
    try {
      const res = await getHistorySongs()
      setHistorySongs(res.data || [])
    } catch (error) {
      console.error('Failed to fetch history:', error)
      setHistorySongs([])
    }
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const handleRestore = async (song: HistorySong) => {
    await restoreSong(song.id)
    await fetchHistory()
    toast.success('已恢復歌曲', { description: `${song.singer} - ${song.song_title}` })
  }

  const handleHardDelete = async (song: HistorySong) => {
    await hardDeleteSong(song.id)
    await fetchHistory()
    setDetailOpen(false)
    setSelectedSong(null)
    toast.warning('已永久刪除', { description: `${song.singer} - ${song.song_title}` })
  }

  const handleHardDeleteAll = async () => {
    await hardDeleteAllSongs()
    await fetchHistory()
    toast.warning('已清空歷史紀錄')
  }

  const openDetailDialog = (song: HistorySong) => {
    setSelectedSong(song)
    setDetailOpen(true)
  }

  return (
    <div className='space-y-5'>
      {/* Statistics Card */}
      <div className='admin-card'>
        <div className='admin-card-content py-5'>
          <div className='grid grid-cols-2 gap-6'>
            <div className='border-r border-[color:var(--admin-border)] pr-6'>
              <p className='font-[family-name:var(--font-space-mono)] text-3xl font-bold'>
                {historySongs.length}
              </p>
              <p className='mt-1 text-xs text-[color:var(--admin-text-muted)]'>歷史歌曲</p>
            </div>
            <div>
              <p className='font-[family-name:var(--font-space-mono)] text-3xl font-bold'>
                {historySongs.filter(s => s.singer).length}
              </p>
              <p className='mt-1 text-xs text-[color:var(--admin-text-muted)]'>可恢復歌曲</p>
            </div>
          </div>
        </div>
      </div>

      {/* History Songs Card */}
      <div className='admin-card'>
        <div className='admin-card-header'>
          <div>
            <h3 className='admin-card-title flex items-center gap-2'>
              <CounterClockwiseClockIcon className='h-4 w-4' />
              歷史紀錄
            </h3>
            <p className='mt-1 text-xs text-[color:var(--admin-text-muted)]'>
              已封存的歌曲，可恢復至播放清單或永久刪除
            </p>
          </div>
          {historySongs.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className='admin-button admin-button-danger admin-button-sm'>
                  <TrashIcon className='h-4 w-4' />
                  清空歷史
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className='admin-shell admin-card border-[color:var(--admin-border-strong)] bg-[color:var(--admin-surface)] text-[color:var(--admin-text)]'>
                <AlertDialogHeader>
                  <AlertDialogTitle className='text-base font-semibold'>
                    確定要永久刪除所有歷史歌曲嗎？
                  </AlertDialogTitle>
                  <AlertDialogDescription className='text-[color:var(--admin-text-muted)]'>
                    此操作無法復原，所有歷史紀錄將被永久刪除。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className='gap-2'>
                  <AlertDialogCancel className='admin-button'>取消</AlertDialogCancel>
                  <AlertDialogAction
                    className='admin-button admin-button-primary'
                    onClick={handleHardDeleteAll}
                  >
                    確定刪除
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <div className='admin-card-content'>
          {historySongs.length > 0 ? (
            <div className='flex flex-col gap-2'>
              {historySongs.map(song => (
                <div
                  key={song.id}
                  className='flex flex-col gap-3 rounded-[var(--admin-radius-sm)] border border-[color:var(--admin-border)] px-4 py-3 transition-colors hover:border-[color:var(--admin-border-strong)] md:grid md:grid-cols-[1fr_2fr_auto] md:items-center md:gap-4'
                >
                  <div className='md:contents'>
                    <div className='text-sm text-[color:var(--admin-text)]'>{song.singer || '—'}</div>
                    <div className='text-sm text-[color:var(--admin-text-muted)]'>
                      {song.song_title || '—'}
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => handleRestore(song)}
                      className='admin-button admin-button-sm'
                      title='恢復至播放清單'
                    >
                      <ResetIcon className='h-4 w-4' />
                      <span className='hidden md:inline'>恢復</span>
                    </button>
                    <button
                      onClick={() => openDetailDialog(song)}
                      className='admin-button admin-button-ghost admin-button-sm'
                      title='查看詳情 / 永久刪除'
                    >
                      <TrashIcon className='h-4 w-4' />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-14 text-center'>
              <ArchiveIcon className='mb-3 h-10 w-10 text-[color:var(--admin-text-subtle)]' />
              <p className='text-sm text-[color:var(--admin-text-muted)]'>目前沒有歷史紀錄</p>
              <p className='mt-1 text-xs text-[color:var(--admin-text-subtle)]'>
                從播放清單封存的歌曲會顯示在這裡
              </p>
            </div>
          )}
        </div>

        {historySongs.length > 0 && (
          <div className='border-t border-[color:var(--admin-border)] px-5 py-3'>
            <p className='text-xs text-[color:var(--admin-text-muted)]'>
              共 {historySongs.length} 首歷史歌曲
            </p>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className='admin-shell admin-card border-[color:var(--admin-border-strong)] bg-[color:var(--admin-surface)] text-[color:var(--admin-text)] sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle className='text-base font-semibold'>歌曲詳情</DialogTitle>
          </DialogHeader>
          {selectedSong && (
            <div className='grid gap-4 py-2'>
              <div className='rounded-[var(--admin-radius-sm)] border border-[color:var(--admin-border)] bg-[color:var(--admin-bg)] p-4'>
                <div className='mb-3'>
                  <p className='text-[11px] font-medium uppercase tracking-wider text-[color:var(--admin-text-subtle)]'>
                    歌手
                  </p>
                  <p className='mt-1 text-base text-[color:var(--admin-text)]'>
                    {selectedSong.singer || '未知'}
                  </p>
                </div>
                <div>
                  <p className='text-[11px] font-medium uppercase tracking-wider text-[color:var(--admin-text-subtle)]'>
                    歌名
                  </p>
                  <p className='mt-1 text-base text-[color:var(--admin-text)]'>
                    {selectedSong.song_title || '未知'}
                  </p>
                </div>
              </div>

              <div className='flex flex-col gap-2'>
                <button
                  onClick={() => handleRestore(selectedSong)}
                  className='admin-button w-full'
                >
                  <ResetIcon className='h-4 w-4' />
                  恢復至播放清單
                </button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className='admin-button admin-button-danger w-full'>
                      <TrashIcon className='h-4 w-4' />
                      永久刪除
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className='admin-shell admin-card border-[color:var(--admin-border-strong)] bg-[color:var(--admin-surface)] text-[color:var(--admin-text)]'>
                    <AlertDialogHeader>
                      <AlertDialogTitle className='text-base font-semibold'>
                        確定要永久刪除這首歌曲嗎？
                      </AlertDialogTitle>
                      <AlertDialogDescription className='text-[color:var(--admin-text-muted)]'>
                        「{selectedSong.singer} - {selectedSong.song_title}」將被永久刪除，此操作無法復原。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className='gap-2'>
                      <AlertDialogCancel className='admin-button'>取消</AlertDialogCancel>
                      <AlertDialogAction
                        className='admin-button admin-button-primary'
                        onClick={() => handleHardDelete(selectedSong)}
                      >
                        確定刪除
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
          <DialogFooter>
            <button
              onClick={() => {
                setDetailOpen(false)
                setSelectedSong(null)
              }}
              className='admin-button'
            >
              關閉
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Info Card */}
      <div className='admin-card'>
        <div className='admin-card-header'>
          <h3 className='admin-card-title'>說明</h3>
        </div>
        <div className='admin-card-content'>
          <div className='space-y-4 text-sm text-[color:var(--admin-text-muted)]'>
            <InfoRow icon={<ArchiveIcon className='h-4 w-4' />} title='封存功能'>
              在播放清單中點擊封存按鈕，歌曲會移至歷史紀錄，不會真正刪除。
            </InfoRow>
            <InfoRow icon={<ResetIcon className='h-4 w-4' />} title='恢復功能'>
              點擊恢復按鈕，歌曲會重新加入播放清單的末端。
            </InfoRow>
            <InfoRow icon={<TrashIcon className='h-4 w-4' />} title='永久刪除'>
              永久刪除會將歌曲從資料庫中完全移除，無法恢復。
            </InfoRow>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({
  icon,
  title,
  children,
}: {
  icon: ReactNode
  title: string
  children: ReactNode
}) {
  return (
    <div className='flex items-start gap-3'>
      <div className='mt-0.5 flex-shrink-0 text-[color:var(--admin-text-subtle)]'>{icon}</div>
      <div>
        <p className='font-medium text-[color:var(--admin-text)]'>{title}</p>
        <p className='mt-1'>{children}</p>
      </div>
    </div>
  )
}
