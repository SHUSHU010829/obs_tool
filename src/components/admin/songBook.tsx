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

  const handleRestore = async (id: number) => {
    await restoreSong(id)
    await fetchHistory()
  }

  const handleHardDelete = async (id: number) => {
    await hardDeleteSong(id)
    await fetchHistory()
    setDetailOpen(false)
    setSelectedSong(null)
  }

  const handleHardDeleteAll = async () => {
    await hardDeleteAllSongs()
    await fetchHistory()
  }

  const openDetailDialog = (song: HistorySong) => {
    setSelectedSong(song)
    setDetailOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Statistics Card */}
      <div className="eink-card">
        <div className="eink-card-content py-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="border-r border-[var(--eink-border-subtle)] pr-6">
              <p className="font-eink-sans text-3xl font-bold text-[var(--eink-text-primary)]">
                {historySongs.length}
              </p>
              <p className="mt-1 font-eink-serif text-sm text-[var(--eink-text-muted)]">
                歷史歌曲
              </p>
            </div>
            <div>
              <p className="font-eink-sans text-3xl font-bold text-[var(--eink-text-primary)]">
                {historySongs.filter(s => s.singer).length}
              </p>
              <p className="mt-1 font-eink-serif text-sm text-[var(--eink-text-muted)]">
                可恢復歌曲
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* History Songs Card */}
      <div className="eink-card">
        <div className="eink-card-header flex items-center justify-between">
          <div>
            <h3 className="eink-card-title flex items-center gap-2">
              <CounterClockwiseClockIcon className="h-5 w-5" />
              歷史紀錄
            </h3>
            <p className="mt-1 font-eink-serif text-sm text-[var(--eink-text-muted)]">
              已歸檔的歌曲，可恢復至播放清單或永久刪除
            </p>
          </div>
          {historySongs.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="eink-button eink-button-destructive flex items-center gap-2">
                  <TrashIcon className="h-4 w-4" />
                  清空歷史
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="eink-card border-[var(--eink-border-strong)]">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-eink-sans text-lg font-semibold">
                    確定要永久刪除所有歷史歌曲嗎？
                  </AlertDialogTitle>
                  <AlertDialogDescription className="font-eink-serif text-[var(--eink-text-muted)]">
                    此操作無法復原，所有歷史紀錄將被永久刪除。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                  <AlertDialogCancel className="eink-button">取消</AlertDialogCancel>
                  <AlertDialogAction
                    className="eink-button eink-button-primary"
                    onClick={handleHardDeleteAll}
                  >
                    確定刪除
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <div className="eink-card-content">
          {/* Table Header */}
          <div className="mb-4 grid grid-cols-[1fr_2fr_120px] gap-4 border-b border-[var(--eink-border-strong)] pb-3">
            <span className="font-eink-sans text-xs font-semibold uppercase tracking-wider text-[var(--eink-text-muted)]">
              歌手
            </span>
            <span className="font-eink-sans text-xs font-semibold uppercase tracking-wider text-[var(--eink-text-muted)]">
              歌名
            </span>
            <span className="font-eink-sans text-xs font-semibold uppercase tracking-wider text-[var(--eink-text-muted)]">
              操作
            </span>
          </div>

          {/* History Songs List */}
          {historySongs.length > 0 ? (
            <div className="flex flex-col gap-3">
              {historySongs.map(song => (
                <div
                  key={song.id}
                  className="grid grid-cols-[1fr_2fr_120px] items-center gap-4 rounded-eink border border-[var(--eink-border-subtle)] p-4 transition-all duration-eink-fast ease-eink hover:border-[var(--eink-border-strong)]"
                >
                  <div>
                    <span className="font-eink-serif text-sm text-[var(--eink-text-primary)]">
                      {song.singer || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="font-eink-serif text-sm text-[var(--eink-text-secondary)]">
                      {song.song_title || '—'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {/* Restore Button */}
                    <button
                      onClick={() => handleRestore(song.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-eink border border-[var(--eink-border-strong)] transition-all duration-eink-fast ease-eink hover:bg-[var(--eink-text-primary)] hover:text-[var(--eink-bg-secondary)]"
                      title="恢復至播放清單"
                    >
                      <ResetIcon className="h-4 w-4" />
                    </button>
                    {/* Detail/Delete Button */}
                    <button
                      onClick={() => openDetailDialog(song)}
                      className="flex h-10 w-10 items-center justify-center rounded-eink border border-[var(--eink-border-strong)] transition-all duration-eink-fast ease-eink hover:bg-[var(--eink-text-primary)] hover:text-[var(--eink-bg-secondary)]"
                      title="查看詳情 / 永久刪除"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ArchiveIcon className="mb-4 h-12 w-12 text-[var(--eink-text-muted)]" />
              <p className="font-eink-serif text-lg text-[var(--eink-text-muted)]">
                目前沒有歷史紀錄
              </p>
              <p className="mt-2 font-eink-serif text-sm text-[var(--eink-text-muted)]">
                從播放清單歸檔的歌曲會顯示在這裡
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {historySongs.length > 0 && (
          <div className="border-t border-[var(--eink-border-strong)] p-4">
            <p className="font-eink-serif text-sm text-[var(--eink-text-muted)]">
              共 {historySongs.length} 首歷史歌曲
            </p>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="eink-card border-[var(--eink-border-strong)] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-eink-sans text-lg font-semibold">
              歌曲詳情
            </DialogTitle>
          </DialogHeader>
          {selectedSong && (
            <div className="grid gap-4 py-4">
              <div className="rounded-eink border border-[var(--eink-border-subtle)] bg-[var(--eink-bg-primary)] p-4">
                <div className="mb-3">
                  <p className="font-eink-sans text-xs font-medium uppercase tracking-wider text-[var(--eink-text-muted)]">
                    歌手
                  </p>
                  <p className="mt-1 font-eink-serif text-lg text-[var(--eink-text-primary)]">
                    {selectedSong.singer || '未知'}
                  </p>
                </div>
                <div>
                  <p className="font-eink-sans text-xs font-medium uppercase tracking-wider text-[var(--eink-text-muted)]">
                    歌名
                  </p>
                  <p className="mt-1 font-eink-serif text-lg text-[var(--eink-text-primary)]">
                    {selectedSong.song_title || '未知'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    handleRestore(selectedSong.id)
                    setDetailOpen(false)
                    setSelectedSong(null)
                  }}
                  className="eink-button flex w-full items-center justify-center gap-2"
                >
                  <ResetIcon className="h-4 w-4" />
                  恢復至播放清單
                </button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="eink-button eink-button-destructive flex w-full items-center justify-center gap-2">
                      <TrashIcon className="h-4 w-4" />
                      永久刪除
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="eink-card border-[var(--eink-border-strong)]">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-eink-sans text-lg font-semibold">
                        確定要永久刪除這首歌曲嗎？
                      </AlertDialogTitle>
                      <AlertDialogDescription className="font-eink-serif text-[var(--eink-text-muted)]">
                        「{selectedSong.singer} - {selectedSong.song_title}」將被永久刪除，此操作無法復原。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                      <AlertDialogCancel className="eink-button">取消</AlertDialogCancel>
                      <AlertDialogAction
                        className="eink-button eink-button-primary"
                        onClick={() => handleHardDelete(selectedSong.id)}
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
              className="eink-button"
            >
              關閉
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Info Card */}
      <div className="eink-card">
        <div className="eink-card-header">
          <h3 className="eink-card-title">說明</h3>
        </div>
        <div className="eink-card-content">
          <div className="space-y-4 font-eink-serif text-sm text-[var(--eink-text-secondary)]">
            <div className="flex items-start gap-3">
              <ArchiveIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--eink-text-muted)]" />
              <div>
                <p className="font-medium text-[var(--eink-text-primary)]">歸檔功能</p>
                <p className="mt-1">
                  在播放清單中點擊歸檔按鈕，歌曲會移至歷史紀錄，不會真正刪除。
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ResetIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--eink-text-muted)]" />
              <div>
                <p className="font-medium text-[var(--eink-text-primary)]">恢復功能</p>
                <p className="mt-1">
                  點擊恢復按鈕，歌曲會重新加入播放清單的末端。
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <TrashIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--eink-text-muted)]" />
              <div>
                <p className="font-medium text-[var(--eink-text-primary)]">永久刪除</p>
                <p className="mt-1">
                  永久刪除會將歌曲從資料庫中完全移除，無法恢復。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
