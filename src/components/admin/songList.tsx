'use client'

import {
  addSong,
  batchUpdateSortOrder,
  clearNowPlaying,
  deleteAllSongs,
  deleteSong,
  getActiveSongs,
  playSong,
  updateSong,
} from '@/api/song'
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ArchiveIcon, DragHandleDots2Icon } from '@radix-ui/react-icons'
import React, { useCallback, useEffect, useRef, useState } from 'react'

interface Song {
  id: number
  song_title: string
  singer: string
  now_playing: number
  status: number
  sort_order: number
}

export default function SongList() {
  const [songList, setSongList] = useState<Song[]>([])
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [open, setOpen] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const dragNodeRef = useRef<HTMLDivElement | null>(null)

  const fetchSongs = useCallback(async () => {
    const res = await getActiveSongs()
    setSongList(res.data || [])
  }, [])

  useEffect(() => {
    fetchSongs()
  }, [fetchSongs])

  const handleAddSong = async () => {
    await addSong(title, artist)
    await fetchSongs()
    setOpen(false)
    setTitle('')
    setArtist('')
  }

  const handleUpdate = async (id: number, artistInput: string, titleInput: string) => {
    await updateSong(id, titleInput, artistInput)
    await fetchSongs()
  }

  const handleArchive = async (id: number) => {
    await deleteSong(id)
    await fetchSongs()
  }

  const handleArchiveAll = async () => {
    await deleteAllSongs()
    await fetchSongs()
  }

  const handlePlay = async (id: number, now_playing: number) => {
    const currentPlayingSong = songList?.find(song => song.now_playing === 1)
    if (currentPlayingSong) {
      await clearNowPlaying(currentPlayingSong.id)
    }
    if (now_playing === 1) {
      await clearNowPlaying(id)
    } else {
      await playSong(id)
    }
    await fetchSongs()
  }

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index)
    dragNodeRef.current = e.currentTarget as HTMLDivElement
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())

    // Add dragging class after a small delay for visual feedback
    setTimeout(() => {
      if (dragNodeRef.current) {
        dragNodeRef.current.style.opacity = '0.5'
      }
    }, 0)
  }

  const handleDragEnd = async () => {
    if (dragNodeRef.current) {
      dragNodeRef.current.style.opacity = '1'
    }

    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newList = [...songList]
      const [draggedItem] = newList.splice(draggedIndex, 1)
      newList.splice(dragOverIndex, 0, draggedItem)

      // Update local state immediately for smooth UX
      setSongList(newList)

      // Prepare batch update data
      const sortData = newList.map((song, index) => ({
        id: song.id,
        sort_order: index,
      }))

      // Send batch update to server
      await batchUpdateSortOrder(sortData)
    }

    setDraggedIndex(null)
    setDragOverIndex(null)
    dragNodeRef.current = null
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDragLeave = () => {
    // Only clear if we're leaving the container entirely
  }

  return (
    <div className="eink-card">
      {/* Card Header */}
      <div className="eink-card-header flex items-center justify-between">
        <div>
          <h3 className="eink-card-title">播放清單</h3>
          <p className="mt-1 font-eink-serif text-sm text-[var(--eink-text-muted)]">
            共 {songList?.length || 0} 首歌曲（可拖曳排序）
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="eink-button eink-button-destructive flex items-center gap-2">
              <ArchiveIcon className="h-4 w-4" />
              全部歸檔
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="eink-card border-[var(--eink-border-strong)]">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-eink-sans text-lg font-semibold">
                確定要歸檔所有歌曲嗎？
              </AlertDialogTitle>
              <AlertDialogDescription className="font-eink-serif text-[var(--eink-text-muted)]">
                所有歌曲將移至歷史紀錄，您可以在「歌本」頁面中恢復。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel className="eink-button">取消</AlertDialogCancel>
              <AlertDialogAction
                className="eink-button eink-button-primary"
                onClick={handleArchiveAll}
              >
                確定歸檔
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Card Content */}
      <div className="eink-card-content">
        {/* Table Header */}
        <div className="mb-4 grid grid-cols-[40px_60px_1fr_2fr_60px] gap-4 border-b border-[var(--eink-border-strong)] pb-3">
          <span className="font-eink-sans text-xs font-semibold uppercase tracking-wider text-[var(--eink-text-muted)]">
            排序
          </span>
          <span className="font-eink-sans text-xs font-semibold uppercase tracking-wider text-[var(--eink-text-muted)]">
            序號
          </span>
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

        {/* Song List */}
        {songList && songList.length > 0 ? (
          <div className="flex flex-col gap-3">
            {songList.map((song, index) => (
              <div
                key={song.id}
                draggable
                onDragStart={e => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={e => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                className={`grid grid-cols-[40px_60px_1fr_2fr_60px] items-center gap-4 rounded-eink border p-3 transition-all duration-eink-fast ease-eink ${
                  song.now_playing === 1
                    ? 'border-[var(--eink-border-strong)] bg-[var(--eink-text-primary)] text-[var(--eink-bg-secondary)]'
                    : dragOverIndex === index
                      ? 'border-[var(--eink-border-strong)] bg-[var(--eink-bg-primary)]'
                      : 'border-[var(--eink-border-subtle)] hover:border-[var(--eink-border-strong)]'
                }`}
              >
                {/* Drag Handle */}
                <div
                  className={`flex h-10 w-10 cursor-grab items-center justify-center rounded-eink transition-colors active:cursor-grabbing ${
                    song.now_playing === 1
                      ? 'text-[var(--eink-bg-secondary)]'
                      : 'text-[var(--eink-text-muted)] hover:text-[var(--eink-text-primary)]'
                  }`}
                >
                  <DragHandleDots2Icon className="h-5 w-5" />
                </div>

                {/* Index Button */}
                <button
                  onClick={() => handlePlay(song.id, song.now_playing)}
                  className={`flex h-10 w-10 items-center justify-center rounded-eink border font-eink-sans text-sm font-bold transition-all duration-eink-fast ease-eink ${
                    song.now_playing === 1
                      ? 'border-[var(--eink-bg-secondary)] bg-[var(--eink-bg-secondary)] text-[var(--eink-text-primary)]'
                      : 'border-[var(--eink-border-strong)] hover:bg-[var(--eink-text-primary)] hover:text-[var(--eink-bg-secondary)]'
                  }`}
                  title={song.now_playing === 1 ? '停止播放' : '開始播放'}
                >
                  {String(index + 1).padStart(2, '0')}
                </button>

                {/* Artist Input */}
                <input
                  type="text"
                  defaultValue={song.singer}
                  onBlur={e => handleUpdate(song.id, e.target.value, song.song_title)}
                  className={`eink-input w-full ${
                    song.now_playing === 1
                      ? 'border-[var(--eink-bg-secondary)] bg-transparent text-[var(--eink-bg-secondary)] placeholder:text-[var(--eink-bg-secondary)]/50'
                      : ''
                  }`}
                  placeholder="歌手名稱"
                />

                {/* Title Input */}
                <input
                  type="text"
                  defaultValue={song.song_title}
                  onBlur={e => handleUpdate(song.id, song.singer, e.target.value)}
                  className={`eink-input w-full ${
                    song.now_playing === 1
                      ? 'border-[var(--eink-bg-secondary)] bg-transparent text-[var(--eink-bg-secondary)] placeholder:text-[var(--eink-bg-secondary)]/50'
                      : ''
                  }`}
                  placeholder="歌曲名稱"
                />

                {/* Archive Button */}
                <button
                  onClick={() => handleArchive(song.id)}
                  className={`flex h-10 w-10 items-center justify-center rounded-eink border transition-all duration-eink-fast ease-eink ${
                    song.now_playing === 1
                      ? 'border-[var(--eink-bg-secondary)] text-[var(--eink-bg-secondary)] hover:bg-[var(--eink-bg-secondary)] hover:text-[var(--eink-text-primary)]'
                      : 'border-[var(--eink-border-strong)] hover:bg-[var(--eink-text-primary)] hover:text-[var(--eink-bg-secondary)]'
                  }`}
                  title="歸檔歌曲"
                >
                  <ArchiveIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="font-eink-serif text-lg text-[var(--eink-text-muted)]">目前沒有歌曲</p>
            <p className="mt-2 font-eink-serif text-sm text-[var(--eink-text-muted)]">
              點擊下方按鈕新增第一首歌曲
            </p>
          </div>
        )}

        {/* Add Song Button */}
        <Dialog onOpenChange={setOpen} open={open}>
          <DialogTrigger asChild>
            <button className="eink-button mt-6 w-full">+ 新增歌曲</button>
          </DialogTrigger>
          <DialogContent className="eink-card border-[var(--eink-border-strong)] sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="font-eink-sans text-lg font-semibold">新增歌曲</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label
                  htmlFor="artist"
                  className="font-eink-sans text-sm font-medium text-[var(--eink-text-secondary)]"
                >
                  歌手
                </label>
                <input
                  id="artist"
                  type="text"
                  value={artist}
                  onChange={e => setArtist(e.target.value)}
                  className="eink-input w-full"
                  placeholder="輸入歌手名稱"
                />
              </div>
              <div className="grid gap-2">
                <label
                  htmlFor="title"
                  className="font-eink-sans text-sm font-medium text-[var(--eink-text-secondary)]"
                >
                  歌名
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="eink-input w-full"
                  placeholder="輸入歌曲名稱"
                />
              </div>
            </div>
            <DialogFooter>
              <button
                type="submit"
                onClick={handleAddSong}
                className="eink-button eink-button-primary"
                disabled={!title || !artist}
              >
                確認新增
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Now Playing Indicator */}
      {songList?.some(song => song.now_playing === 1) && (
        <div className="border-t border-[var(--eink-border-strong)] p-4">
          <div className="flex items-center gap-3">
            <span className="eink-badge eink-badge-active">播放中</span>
            <span className="font-eink-serif text-sm">
              {songList.find(song => song.now_playing === 1)?.singer} -{' '}
              {songList.find(song => song.now_playing === 1)?.song_title}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
