'use client'

import { useCallback, useEffect, useState } from 'react'
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
} from '@/components/ui/dialog'
import {
  ArchiveIcon,
  MagnifyingGlassIcon,
  Pencil1Icon,
  PlusIcon,
  ResetIcon,
} from '@radix-ui/react-icons'
import { toast } from 'sonner'

import CategoryManager from '@/components/admin/categoryManager'
import {
  createRepertoire,
  deleteRepertoire,
  getCategories,
  getRepertoireList,
  restoreRepertoire,
  updateRepertoire,
} from '@/api/repertoire'
import type { RepertoireSong, SongCategory } from '@/api/repertoire'

export default function SongBook() {
  const [repertoire, setRepertoire] = useState<RepertoireSong[]>([])
  const [categories, setCategories] = useState<SongCategory[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<number>>(new Set())
  const [showArchived, setShowArchived] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<RepertoireSong | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formSinger, setFormSinger] = useState('')
  const [formNote, setFormNote] = useState('')
  const [formCategoryIds, setFormCategoryIds] = useState<Set<number>>(new Set())

  const fetchAll = useCallback(async () => {
    try {
      const [repRes, catRes] = await Promise.all([
        getRepertoireList(showArchived),
        getCategories(),
      ])
      setRepertoire(repRes.data || [])
      setCategories(catRes.data || [])
    } catch (error) {
      toast.error('讀取曲庫失敗', { description: (error as Error).message })
    }
  }, [showArchived])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const dimensions = Array.from(new Set(categories.map(c => c.dimension)))

  const toggleFilterCategory = (id: number) => {
    setSelectedCategoryIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleFormCategory = (id: number) => {
    setFormCategoryIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filtered = repertoire.filter(song => {
    const query = searchQuery.trim()
    const matchesSearch =
      !query || song.song_title.includes(query) || song.singer.includes(query)
    const matchesCategories =
      selectedCategoryIds.size === 0 ||
      Array.from(selectedCategoryIds).every(id => song.categories.some(c => c.id === id))
    return matchesSearch && matchesCategories
  })

  const openAddDialog = () => {
    setEditing(null)
    setFormTitle('')
    setFormSinger('')
    setFormNote('')
    setFormCategoryIds(new Set())
    setFormOpen(true)
  }

  const openEditDialog = (song: RepertoireSong) => {
    setEditing(song)
    setFormTitle(song.song_title)
    setFormSinger(song.singer)
    setFormNote(song.note ?? '')
    setFormCategoryIds(new Set(song.categories.map(c => c.id)))
    setFormOpen(true)
  }

  const handleSubmit = async () => {
    const categoryIds = Array.from(formCategoryIds)
    try {
      if (editing) {
        await updateRepertoire(editing.id, {
          song_title: formTitle,
          singer: formSinger,
          note: formNote || undefined,
          category_ids: categoryIds,
        })
        toast.success('曲庫已更新', { description: `${formSinger} - ${formTitle}` })
      } else {
        await createRepertoire(formTitle, formSinger, formNote || undefined, categoryIds)
        toast.success('已新增曲目', { description: `${formSinger} - ${formTitle}` })
      }
      await fetchAll()
      setFormOpen(false)
    } catch (error) {
      toast.error(editing ? '更新曲目失敗' : '新增曲目失敗', {
        description: (error as Error).message,
      })
    }
  }

  const handleArchive = async (song: RepertoireSong) => {
    try {
      await deleteRepertoire(song.id)
      await fetchAll()
      toast('已下架', { description: `${song.singer} - ${song.song_title}` })
    } catch (error) {
      toast.error('下架失敗', { description: (error as Error).message })
    }
  }

  const handleRestore = async (song: RepertoireSong) => {
    try {
      await restoreRepertoire(song.id)
      await fetchAll()
      toast.success('已重新上架', { description: `${song.singer} - ${song.song_title}` })
    } catch (error) {
      toast.error('恢復上架失敗', { description: (error as Error).message })
    }
  }

  const activeCount = repertoire.filter(s => s.status === 1).length
  const archivedCount = repertoire.filter(s => s.status === 0).length

  return (
    <div className='space-y-5'>
      {/* Statistics Card */}
      <div className='admin-card'>
        <div className='admin-card-content py-5'>
          <div className='grid grid-cols-2 gap-6'>
            <div className='border-r border-[color:var(--admin-border)] pr-6'>
              <p className='font-[family-name:var(--font-space-mono)] text-3xl font-bold'>
                {activeCount}
              </p>
              <p className='mt-1 text-xs text-[color:var(--admin-text-muted)]'>上架中曲目</p>
            </div>
            <div>
              <p className='font-[family-name:var(--font-space-mono)] text-3xl font-bold'>
                {categories.length}
              </p>
              <p className='mt-1 text-xs text-[color:var(--admin-text-muted)]'>分類數量</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters + List */}
      <div className='admin-card'>
        <div className='admin-card-header'>
          <div>
            <h3 className='admin-card-title'>曲庫</h3>
            <p className='mt-1 text-xs text-[color:var(--admin-text-muted)]'>
              主播會唱的歌曲清單，可依分類篩選
            </p>
          </div>
          <div className='admin-segmented'>
            <button
              onClick={() => setShowArchived(false)}
              className={!showArchived ? 'active' : ''}
            >
              上架中
            </button>
            <button
              onClick={() => setShowArchived(true)}
              className={showArchived ? 'active' : ''}
            >
              含已下架
            </button>
          </div>
        </div>

        <div className='admin-card-content space-y-4'>
          <div className='relative'>
            <MagnifyingGlassIcon className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--admin-text-subtle)]' />
            <input
              type='text'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='admin-input pl-9'
              placeholder='搜尋歌名或歌手'
            />
          </div>

          {dimensions.map(dim => (
            <div key={dim} className='admin-segmented flex-wrap'>
              {categories
                .filter(c => c.dimension === dim)
                .map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => toggleFilterCategory(cat.id)}
                    className={selectedCategoryIds.has(cat.id) ? 'active' : ''}
                  >
                    {cat.label}
                  </button>
                ))}
            </div>
          ))}

          {filtered.length > 0 ? (
            <div className='flex flex-col gap-2'>
              {filtered.map(song => (
                <div
                  key={song.id}
                  className='flex flex-col gap-2 rounded-[var(--admin-radius-sm)] border border-[color:var(--admin-border)] px-4 py-3 transition-colors hover:border-[color:var(--admin-border-strong)]'
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div className='min-w-0'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <span className='text-sm font-medium text-[color:var(--admin-text)]'>
                          {song.song_title}
                        </span>
                        {song.status === 0 && (
                          <span className='admin-badge admin-badge--warn'>已下架</span>
                        )}
                      </div>
                      <p className='mt-0.5 text-sm text-[color:var(--admin-text-muted)]'>
                        {song.singer || '—'}
                      </p>
                      {song.note && (
                        <p className='mt-1 text-xs text-[color:var(--admin-text-subtle)]'>
                          {song.note}
                        </p>
                      )}
                      {song.categories.length > 0 && (
                        <div className='mt-2 flex flex-wrap gap-1.5'>
                          {song.categories.map(c => (
                            <span key={c.id} className='admin-badge'>
                              {c.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className='flex shrink-0 gap-1.5'>
                      <button
                        onClick={() => openEditDialog(song)}
                        className='admin-button admin-button-ghost admin-button-sm h-9 w-9 p-0'
                        title='編輯'
                      >
                        <Pencil1Icon className='h-4 w-4' />
                      </button>
                      {song.status === 1 ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              className='admin-button admin-button-ghost admin-button-sm h-9 w-9 p-0'
                              title='下架'
                            >
                              <ArchiveIcon className='h-4 w-4' />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className='admin-shell admin-card border-[color:var(--admin-border-strong)] bg-[color:var(--admin-surface)] text-[color:var(--admin-text)]'>
                            <AlertDialogHeader>
                              <AlertDialogTitle className='text-base font-semibold'>
                                確定要下架「{song.song_title}」嗎？
                              </AlertDialogTitle>
                              <AlertDialogDescription className='text-[color:var(--admin-text-muted)]'>
                                下架後可以在「含已下架」檢視裡重新上架，不會遺失資料。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className='gap-2'>
                              <AlertDialogCancel className='admin-button'>
                                取消
                              </AlertDialogCancel>
                              <AlertDialogAction
                                className='admin-button admin-button-primary'
                                onClick={() => handleArchive(song)}
                              >
                                確定下架
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <button
                          onClick={() => handleRestore(song)}
                          className='admin-button admin-button-sm h-9 w-9 p-0'
                          title='重新上架'
                        >
                          <ResetIcon className='h-4 w-4' />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-14 text-center'>
              <p className='text-sm text-[color:var(--admin-text-muted)]'>沒有符合條件的曲目</p>
            </div>
          )}

          <button onClick={openAddDialog} className='admin-button admin-button-primary w-full'>
            <PlusIcon className='h-4 w-4' />
            新增曲目
          </button>
        </div>

        <div className='border-t border-[color:var(--admin-border)] px-5 py-3'>
          <p className='text-xs text-[color:var(--admin-text-muted)]'>
            共 {filtered.length} / {activeCount + archivedCount} 首曲目
          </p>
        </div>
      </div>

      <CategoryManager categories={categories} onChanged={fetchAll} />

      {/* Add / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className='admin-shell admin-card border-[color:var(--admin-border-strong)] bg-[color:var(--admin-surface)] text-[color:var(--admin-text)] sm:max-w-[480px]'>
          <DialogHeader>
            <DialogTitle className='text-base font-semibold'>
              {editing ? '編輯曲目' : '新增曲目'}
            </DialogTitle>
          </DialogHeader>
          <div className='grid gap-4 py-2'>
            <div className='grid gap-2'>
              <label className='text-xs font-medium text-[color:var(--admin-text-muted)]'>
                歌名
              </label>
              <input
                type='text'
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                className='admin-input'
                placeholder='輸入歌曲名稱'
              />
            </div>
            <div className='grid gap-2'>
              <label className='text-xs font-medium text-[color:var(--admin-text-muted)]'>
                歌手
              </label>
              <input
                type='text'
                value={formSinger}
                onChange={e => setFormSinger(e.target.value)}
                className='admin-input'
                placeholder='輸入歌手名稱'
              />
            </div>
            <div className='grid gap-2'>
              <label className='text-xs font-medium text-[color:var(--admin-text-muted)]'>
                備註（選填）
              </label>
              <textarea
                value={formNote}
                onChange={e => setFormNote(e.target.value)}
                className='admin-textarea'
                placeholder='key、拿手程度之類的備註'
              />
            </div>
            {dimensions.length > 0 && (
              <div className='grid gap-2'>
                <label className='text-xs font-medium text-[color:var(--admin-text-muted)]'>
                  分類
                </label>
                <div className='space-y-2'>
                  {dimensions.map(dim => (
                    <div key={dim} className='admin-segmented flex-wrap'>
                      {categories
                        .filter(c => c.dimension === dim)
                        .map(cat => (
                          <button
                            key={cat.id}
                            type='button'
                            onClick={() => toggleFormCategory(cat.id)}
                            className={formCategoryIds.has(cat.id) ? 'active' : ''}
                          >
                            {cat.label}
                          </button>
                        ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <button
              onClick={handleSubmit}
              className='admin-button admin-button-primary'
              disabled={!formTitle}
            >
              {editing ? '儲存變更' : '確認新增'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
