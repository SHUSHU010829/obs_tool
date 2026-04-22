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
import { toast } from 'sonner'

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
    toast.success('已新增歌曲', { description: `${artist} - ${title}` })
    setOpen(false)
    setTitle('')
    setArtist('')
  }

  const handleUpdate = async (id: number, artistInput: string, titleInput: string) => {
    await updateSong(id, titleInput, artistInput)
    await fetchSongs()
  }

  const handleArchive = async (song: Song) => {
    await deleteSong(song.id)
    await fetchSongs()
    toast('已封存', { description: `${song.singer} - ${song.song_title}` })
  }

  const handleArchiveAll = async () => {
    await deleteAllSongs()
    await fetchSongs()
    toast.warning('已封存全部歌曲', { description: '可至「歌本」頁面恢復' })
  }

  const handlePlay = async (song: Song) => {
    const currentPlayingSong = songList?.find(s => s.now_playing === 1)
    if (currentPlayingSong) {
      await clearNowPlaying(currentPlayingSong.id)
    }
    if (song.now_playing === 1) {
      await clearNowPlaying(song.id)
      toast('已停止播放')
    } else {
      await playSong(song.id)
      toast.success('開始播放', { description: `${song.singer} - ${song.song_title}` })
    }
    await fetchSongs()
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index)
    dragNodeRef.current = e.currentTarget as HTMLDivElement
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
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
      setSongList(newList)

      const sortData = newList.map((song, index) => ({
        id: song.id,
        sort_order: index,
      }))
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

  const nowPlaying = songList?.find(s => s.now_playing === 1)

  return (
    <div className='admin-card'>
      <div className='admin-card-header'>
        <div>
          <h3 className='admin-card-title'>播放清單</h3>
          <p className='mt-1 text-xs text-[color:var(--admin-text-muted)]'>
            共 {songList?.length || 0} 首歌曲（可拖曳排序）
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className='admin-button admin-button-danger admin-button-sm'>
              <ArchiveIcon className='h-4 w-4' />
              全部封存
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className='admin-shell admin-card border-[color:var(--admin-border-strong)] bg-[color:var(--admin-surface)] text-[color:var(--admin-text)]'>
            <AlertDialogHeader>
              <AlertDialogTitle className='text-base font-semibold'>
                確定要封存所有歌曲嗎？
              </AlertDialogTitle>
              <AlertDialogDescription className='text-[color:var(--admin-text-muted)]'>
                所有歌曲將移至歷史紀錄，您可以在「歌本」頁面中恢復。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className='gap-2'>
              <AlertDialogCancel className='admin-button'>取消</AlertDialogCancel>
              <AlertDialogAction
                className='admin-button admin-button-primary'
                onClick={handleArchiveAll}
              >
                確定封存
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className='admin-card-content'>
        {songList && songList.length > 0 ? (
          <div className='flex flex-col gap-2'>
            {songList.map((song, index) => {
              const isPlaying = song.now_playing === 1
              const isDragOver = dragOverIndex === index
              return (
                <div
                  key={song.id}
                  draggable
                  onDragStart={e => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={e => handleDragOver(e, index)}
                  className={`group flex flex-col gap-2 rounded-[var(--admin-radius-sm)] border px-3 py-2.5 transition-colors md:grid md:grid-cols-[28px_44px_1fr_2fr_44px] md:items-center md:gap-3 ${
                    isPlaying
                      ? 'border-[color:var(--admin-state-live)] bg-[color:var(--admin-state-live-soft)]'
                      : isDragOver
                        ? 'border-[color:var(--admin-accent-border)] bg-[color:var(--admin-surface-2)]'
                        : 'border-[color:var(--admin-border)] hover:border-[color:var(--admin-border-strong)]'
                  }`}
                >
                  <div className='flex items-center justify-between md:contents'>
                    <div className='flex cursor-grab items-center justify-center text-[color:var(--admin-text-subtle)] hover:text-[color:var(--admin-text)] active:cursor-grabbing'>
                      <DragHandleDots2Icon className='h-5 w-5' />
                    </div>

                    <button
                      onClick={() => handlePlay(song)}
                      className={`flex h-9 w-11 shrink-0 items-center justify-center rounded-[var(--admin-radius-sm)] border font-[family-name:var(--font-space-mono)] text-sm font-bold transition-colors ${
                        isPlaying
                          ? 'border-[color:var(--admin-state-live)] bg-[color:var(--admin-state-live)] text-[#0F1115]'
                          : 'border-[color:var(--admin-border-strong)] text-[color:var(--admin-text)] hover:border-[color:var(--admin-accent-border)] hover:bg-[color:var(--admin-accent-soft)]'
                      }`}
                      title={isPlaying ? '停止播放' : '開始播放'}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </button>

                    <input
                      type='text'
                      defaultValue={song.singer}
                      onBlur={e => handleUpdate(song.id, e.target.value, song.song_title)}
                      className='admin-input hidden md:block'
                      placeholder='歌手名稱'
                    />

                    <input
                      type='text'
                      defaultValue={song.song_title}
                      onBlur={e => handleUpdate(song.id, song.singer, e.target.value)}
                      className='admin-input hidden md:block'
                      placeholder='歌曲名稱'
                    />

                    <button
                      onClick={() => handleArchive(song)}
                      className='admin-button admin-button-ghost admin-button-sm flex h-9 w-9 shrink-0 items-center justify-center p-0'
                      title='封存歌曲'
                    >
                      <ArchiveIcon className='h-4 w-4' />
                    </button>
                  </div>

                  <div className='flex flex-col gap-2 md:hidden'>
                    <input
                      type='text'
                      defaultValue={song.singer}
                      onBlur={e => handleUpdate(song.id, e.target.value, song.song_title)}
                      className='admin-input'
                      placeholder='歌手名稱'
                    />
                    <input
                      type='text'
                      defaultValue={song.song_title}
                      onBlur={e => handleUpdate(song.id, song.singer, e.target.value)}
                      className='admin-input'
                      placeholder='歌曲名稱'
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center py-14 text-center'>
            <p className='text-sm text-[color:var(--admin-text-muted)]'>目前沒有歌曲</p>
            <p className='mt-1 text-xs text-[color:var(--admin-text-subtle)]'>
              點擊下方按鈕新增第一首歌曲
            </p>
          </div>
        )}

        <Dialog onOpenChange={setOpen} open={open}>
          <DialogTrigger asChild>
            <button className='admin-button admin-button-primary mt-5 w-full'>+ 新增歌曲</button>
          </DialogTrigger>
          <DialogContent className='admin-shell admin-card border-[color:var(--admin-border-strong)] bg-[color:var(--admin-surface)] text-[color:var(--admin-text)] sm:max-w-[425px]'>
            <DialogHeader>
              <DialogTitle className='text-base font-semibold'>新增歌曲</DialogTitle>
            </DialogHeader>
            <div className='grid gap-4 py-2'>
              <div className='grid gap-2'>
                <label htmlFor='artist' className='text-xs font-medium text-[color:var(--admin-text-muted)]'>
                  歌手
                </label>
                <input
                  id='artist'
                  type='text'
                  value={artist}
                  onChange={e => setArtist(e.target.value)}
                  className='admin-input'
                  placeholder='輸入歌手名稱'
                />
              </div>
              <div className='grid gap-2'>
                <label htmlFor='title' className='text-xs font-medium text-[color:var(--admin-text-muted)]'>
                  歌名
                </label>
                <input
                  id='title'
                  type='text'
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className='admin-input'
                  placeholder='輸入歌曲名稱'
                />
              </div>
            </div>
            <DialogFooter>
              <button
                type='submit'
                onClick={handleAddSong}
                className='admin-button admin-button-primary'
                disabled={!title || !artist}
              >
                確認新增
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {nowPlaying && (
        <div className='border-t border-[color:var(--admin-border)] px-5 py-3'>
          <div className='flex items-center gap-3'>
            <span className='admin-badge admin-badge--live'>播放中</span>
            <span className='truncate text-sm text-[color:var(--admin-text)]'>
              {nowPlaying.singer} · {nowPlaying.song_title}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
