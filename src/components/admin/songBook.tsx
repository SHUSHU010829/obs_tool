'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { TrashIcon, Pencil1Icon } from '@radix-ui/react-icons'

interface SongType {
  id: number
  name: string
  description: string
  songCount: number
}

// Mock data for song types - replace with API calls when backend is ready
const initialSongTypes: SongType[] = [
  { id: 1, name: '流行', description: '流行音樂、當紅歌曲', songCount: 24 },
  { id: 2, name: '經典', description: '經典老歌、懷舊金曲', songCount: 18 },
  { id: 3, name: '動漫', description: '動漫主題曲、角色歌', songCount: 32 },
  { id: 4, name: '西洋', description: '英文歌曲、西洋流行', songCount: 15 },
  { id: 5, name: '原創', description: '原創歌曲、創作曲', songCount: 8 },
]

export default function SongBook() {
  const [songTypes, setSongTypes] = useState<SongType[]>(initialSongTypes)
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingType, setEditingType] = useState<SongType | null>(null)
  const [newTypeName, setNewTypeName] = useState('')
  const [newTypeDescription, setNewTypeDescription] = useState('')

  const handleAddType = () => {
    if (!newTypeName.trim()) return
    const newType: SongType = {
      id: Date.now(),
      name: newTypeName,
      description: newTypeDescription,
      songCount: 0,
    }
    setSongTypes([...songTypes, newType])
    setOpen(false)
    setNewTypeName('')
    setNewTypeDescription('')
  }

  const handleEditType = () => {
    if (!editingType || !newTypeName.trim()) return
    setSongTypes(
      songTypes.map(type =>
        type.id === editingType.id
          ? { ...type, name: newTypeName, description: newTypeDescription }
          : type
      )
    )
    setEditOpen(false)
    setEditingType(null)
    setNewTypeName('')
    setNewTypeDescription('')
  }

  const handleDeleteType = (id: number) => {
    setSongTypes(songTypes.filter(type => type.id !== id))
  }

  const openEditDialog = (type: SongType) => {
    setEditingType(type)
    setNewTypeName(type.name)
    setNewTypeDescription(type.description)
    setEditOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Song Types Card */}
      <div className="eink-card">
        <div className="eink-card-header flex items-center justify-between">
          <div>
            <h3 className="eink-card-title">歌曲類型</h3>
            <p className="mt-1 font-eink-serif text-sm text-[var(--eink-text-muted)]">
              管理歌曲分類，方便整理歌本
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="eink-button eink-button-primary">+ 新增類型</button>
            </DialogTrigger>
            <DialogContent className="eink-card border-[var(--eink-border-strong)] sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="font-eink-sans text-lg font-semibold">
                  新增歌曲類型
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label
                    htmlFor="typeName"
                    className="font-eink-sans text-sm font-medium text-[var(--eink-text-secondary)]"
                  >
                    類型名稱
                  </label>
                  <input
                    id="typeName"
                    type="text"
                    value={newTypeName}
                    onChange={e => setNewTypeName(e.target.value)}
                    className="eink-input w-full"
                    placeholder="例如：流行、經典、動漫"
                  />
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="typeDescription"
                    className="font-eink-sans text-sm font-medium text-[var(--eink-text-secondary)]"
                  >
                    描述
                  </label>
                  <textarea
                    id="typeDescription"
                    value={newTypeDescription}
                    onChange={e => setNewTypeDescription(e.target.value)}
                    className="eink-input min-h-[80px] w-full resize-none"
                    placeholder="簡短描述此類型包含的歌曲"
                  />
                </div>
              </div>
              <DialogFooter>
                <button
                  type="submit"
                  onClick={handleAddType}
                  className="eink-button eink-button-primary"
                  disabled={!newTypeName.trim()}
                >
                  確認新增
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="eink-card-content">
          {/* Table Header */}
          <div className="mb-4 grid grid-cols-[1fr_2fr_100px_100px] gap-4 border-b border-[var(--eink-border-strong)] pb-3">
            <span className="font-eink-sans text-xs font-semibold uppercase tracking-wider text-[var(--eink-text-muted)]">
              類型名稱
            </span>
            <span className="font-eink-sans text-xs font-semibold uppercase tracking-wider text-[var(--eink-text-muted)]">
              描述
            </span>
            <span className="font-eink-sans text-xs font-semibold uppercase tracking-wider text-[var(--eink-text-muted)]">
              歌曲數
            </span>
            <span className="font-eink-sans text-xs font-semibold uppercase tracking-wider text-[var(--eink-text-muted)]">
              操作
            </span>
          </div>

          {/* Song Types List */}
          {songTypes.length > 0 ? (
            <div className="flex flex-col gap-3">
              {songTypes.map(type => (
                <div
                  key={type.id}
                  className="grid grid-cols-[1fr_2fr_100px_100px] items-center gap-4 rounded-eink border border-[var(--eink-border-subtle)] p-4 transition-all duration-eink-fast ease-eink hover:border-[var(--eink-border-strong)]"
                >
                  <div>
                    <span className="font-eink-sans text-base font-medium text-[var(--eink-text-primary)]">
                      {type.name}
                    </span>
                  </div>
                  <div>
                    <span className="font-eink-serif text-sm text-[var(--eink-text-secondary)]">
                      {type.description || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="eink-badge">{type.songCount} 首</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditDialog(type)}
                      className="flex h-10 w-10 items-center justify-center rounded-eink border border-[var(--eink-border-strong)] transition-all duration-eink-fast ease-eink hover:bg-[var(--eink-text-primary)] hover:text-[var(--eink-bg-secondary)]"
                      title="編輯類型"
                    >
                      <Pencil1Icon className="h-4 w-4" />
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          className="flex h-10 w-10 items-center justify-center rounded-eink border border-[var(--eink-border-strong)] transition-all duration-eink-fast ease-eink hover:bg-[var(--eink-text-primary)] hover:text-[var(--eink-bg-secondary)]"
                          title="刪除類型"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="eink-card border-[var(--eink-border-strong)]">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-eink-sans text-lg font-semibold">
                            確定要刪除「{type.name}」類型嗎？
                          </AlertDialogTitle>
                          <AlertDialogDescription className="font-eink-serif text-[var(--eink-text-muted)]">
                            此操作將移除此分類，但不會刪除已歸類的歌曲。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="gap-2">
                          <AlertDialogCancel className="eink-button">取消</AlertDialogCancel>
                          <AlertDialogAction
                            className="eink-button eink-button-primary"
                            onClick={() => handleDeleteType(type.id)}
                          >
                            確定刪除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="font-eink-serif text-lg text-[var(--eink-text-muted)]">
                尚無歌曲類型
              </p>
              <p className="mt-2 font-eink-serif text-sm text-[var(--eink-text-muted)]">
                點擊上方按鈕新增第一個類型
              </p>
            </div>
          )}
        </div>

        {/* Summary Footer */}
        <div className="border-t border-[var(--eink-border-strong)] p-4">
          <div className="flex items-center justify-between">
            <span className="font-eink-serif text-sm text-[var(--eink-text-muted)]">
              共 {songTypes.length} 種類型
            </span>
            <span className="font-eink-serif text-sm text-[var(--eink-text-muted)]">
              共 {songTypes.reduce((acc, type) => acc + type.songCount, 0)} 首歌曲
            </span>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="eink-card border-[var(--eink-border-strong)] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-eink-sans text-lg font-semibold">
              編輯歌曲類型
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label
                htmlFor="editTypeName"
                className="font-eink-sans text-sm font-medium text-[var(--eink-text-secondary)]"
              >
                類型名稱
              </label>
              <input
                id="editTypeName"
                type="text"
                value={newTypeName}
                onChange={e => setNewTypeName(e.target.value)}
                className="eink-input w-full"
                placeholder="例如：流行、經典、動漫"
              />
            </div>
            <div className="grid gap-2">
              <label
                htmlFor="editTypeDescription"
                className="font-eink-sans text-sm font-medium text-[var(--eink-text-secondary)]"
              >
                描述
              </label>
              <textarea
                id="editTypeDescription"
                value={newTypeDescription}
                onChange={e => setNewTypeDescription(e.target.value)}
                className="eink-input min-h-[80px] w-full resize-none"
                placeholder="簡短描述此類型包含的歌曲"
              />
            </div>
          </div>
          <DialogFooter>
            <button
              type="submit"
              onClick={handleEditType}
              className="eink-button eink-button-primary"
              disabled={!newTypeName.trim()}
            >
              儲存變更
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Statistics Card */}
      <div className="eink-card">
        <div className="eink-card-header">
          <h3 className="eink-card-title">歌本統計</h3>
        </div>
        <div className="eink-card-content">
          <div className="grid grid-cols-3 gap-6">
            <div className="border-r border-[var(--eink-border-subtle)] pr-6">
              <p className="font-eink-sans text-3xl font-bold text-[var(--eink-text-primary)]">
                {songTypes.length}
              </p>
              <p className="mt-1 font-eink-serif text-sm text-[var(--eink-text-muted)]">
                歌曲類型
              </p>
            </div>
            <div className="border-r border-[var(--eink-border-subtle)] pr-6">
              <p className="font-eink-sans text-3xl font-bold text-[var(--eink-text-primary)]">
                {songTypes.reduce((acc, type) => acc + type.songCount, 0)}
              </p>
              <p className="mt-1 font-eink-serif text-sm text-[var(--eink-text-muted)]">
                總歌曲數
              </p>
            </div>
            <div>
              <p className="font-eink-sans text-3xl font-bold text-[var(--eink-text-primary)]">
                {songTypes.length > 0
                  ? Math.round(
                      songTypes.reduce((acc, type) => acc + type.songCount, 0) /
                        songTypes.length
                    )
                  : 0}
              </p>
              <p className="mt-1 font-eink-serif text-sm text-[var(--eink-text-muted)]">
                平均每類型
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
