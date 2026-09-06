'use client'

import { useState } from 'react'
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
import { ChevronDownIcon, Pencil1Icon, PlusIcon, TrashIcon } from '@radix-ui/react-icons'
import { toast } from 'sonner'

import { createCategory, deleteCategory, updateCategory } from '@/api/repertoire'
import type { SongCategory } from '@/api/repertoire'

interface CategoryManagerProps {
  categories: SongCategory[]
  onChanged: () => Promise<void> | void
}

export default function CategoryManager({ categories, onChanged }: CategoryManagerProps) {
  const [expanded, setExpanded] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [editing, setEditing] = useState<SongCategory | null>(null)
  const [dimension, setDimension] = useState('')
  const [slug, setSlug] = useState('')
  const [label, setLabel] = useState('')

  const dimensions = Array.from(new Set(categories.map(c => c.dimension)))

  const resetForm = () => {
    setDimension('')
    setSlug('')
    setLabel('')
  }

  const handleAdd = async () => {
    try {
      await createCategory(dimension, slug, label)
      await onChanged()
      toast.success('已新增分類', { description: `${dimension} / ${label}` })
      setAddOpen(false)
      resetForm()
    } catch (error) {
      toast.error('新增分類失敗', { description: (error as Error).message })
    }
  }

  const openEdit = (category: SongCategory) => {
    setEditing(category)
    setSlug(category.slug)
    setLabel(category.label)
  }

  const handleEdit = async () => {
    if (!editing) return
    try {
      await updateCategory(editing.id, { slug, label })
      await onChanged()
      toast.success('分類已更新')
      setEditing(null)
    } catch (error) {
      toast.error('更新分類失敗', { description: (error as Error).message })
    }
  }

  const handleDelete = async (category: SongCategory) => {
    try {
      await deleteCategory(category.id)
      await onChanged()
      toast('已刪除分類', { description: `${category.dimension} / ${category.label}` })
    } catch (error) {
      toast.error('刪除分類失敗', { description: (error as Error).message })
    }
  }

  return (
    <div className='admin-card'>
      <button
        onClick={() => setExpanded(prev => !prev)}
        className='admin-card-header w-full text-left'
      >
        <div>
          <h3 className='admin-card-title'>分類管理</h3>
          <p className='mt-1 text-xs text-[color:var(--admin-text-muted)]'>
            共 {categories.length} 個分類，橫跨 {dimensions.length} 個維度
          </p>
        </div>
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <div className='admin-card-content space-y-5'>
          {dimensions.length > 0 ? (
            dimensions.map(dim => (
              <div key={dim}>
                <p className='mb-2 text-[11px] font-medium uppercase tracking-wider text-[color:var(--admin-text-subtle)]'>
                  {dim}
                </p>
                <div className='flex flex-col gap-2'>
                  {categories
                    .filter(c => c.dimension === dim)
                    .map(category => (
                      <div
                        key={category.id}
                        className='flex items-center justify-between gap-3 rounded-[var(--admin-radius-sm)] border border-[color:var(--admin-border)] px-3 py-2'
                      >
                        <div className='min-w-0'>
                          <span className='text-sm text-[color:var(--admin-text)]'>
                            {category.label}
                          </span>
                          <span className='ml-2 text-xs text-[color:var(--admin-text-subtle)]'>
                            {category.slug}
                          </span>
                        </div>
                        <div className='flex shrink-0 gap-1.5'>
                          <button
                            onClick={() => openEdit(category)}
                            className='admin-button admin-button-ghost admin-button-sm h-8 w-8 p-0'
                            title='編輯分類'
                          >
                            <Pencil1Icon className='h-3.5 w-3.5' />
                          </button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                className='admin-button admin-button-ghost admin-button-sm h-8 w-8 p-0'
                                title='刪除分類'
                              >
                                <TrashIcon className='h-3.5 w-3.5' />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className='admin-shell admin-card border-[color:var(--admin-border-strong)] bg-[color:var(--admin-surface)] text-[color:var(--admin-text)]'>
                              <AlertDialogHeader>
                                <AlertDialogTitle className='text-base font-semibold'>
                                  確定要刪除「{category.label}」嗎？
                                </AlertDialogTitle>
                                <AlertDialogDescription className='text-[color:var(--admin-text-muted)]'>
                                  曲庫裡掛著這個分類的歌曲會一併移除這個標籤，此操作無法復原。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className='gap-2'>
                                <AlertDialogCancel className='admin-button'>
                                  取消
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className='admin-button admin-button-primary'
                                  onClick={() => handleDelete(category)}
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
              </div>
            ))
          ) : (
            <p className='text-sm text-[color:var(--admin-text-muted)]'>目前沒有任何分類</p>
          )}

          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <button className='admin-button w-full' onClick={resetForm}>
                <PlusIcon className='h-4 w-4' />
                新增分類
              </button>
            </DialogTrigger>
            <DialogContent className='admin-shell admin-card border-[color:var(--admin-border-strong)] bg-[color:var(--admin-surface)] text-[color:var(--admin-text)] sm:max-w-[425px]'>
              <DialogHeader>
                <DialogTitle className='text-base font-semibold'>新增分類</DialogTitle>
              </DialogHeader>
              <div className='grid gap-4 py-2'>
                <FormField label='維度（例如 language、mood）' value={dimension} onChange={setDimension} placeholder='language' />
                <FormField label='Slug（例如 zh、ja）' value={slug} onChange={setSlug} placeholder='zh' />
                <FormField label='顯示名稱' value={label} onChange={setLabel} placeholder='中文' />
              </div>
              <DialogFooter>
                <button
                  onClick={handleAdd}
                  className='admin-button admin-button-primary'
                  disabled={!dimension || !slug || !label}
                >
                  確認新增
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <Dialog open={editing !== null} onOpenChange={open => !open && setEditing(null)}>
        <DialogContent className='admin-shell admin-card border-[color:var(--admin-border-strong)] bg-[color:var(--admin-surface)] text-[color:var(--admin-text)] sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle className='text-base font-semibold'>編輯分類</DialogTitle>
          </DialogHeader>
          <div className='grid gap-4 py-2'>
            <FormField label='Slug' value={slug} onChange={setSlug} placeholder='zh' />
            <FormField label='顯示名稱' value={label} onChange={setLabel} placeholder='中文' />
          </div>
          <DialogFooter>
            <button
              onClick={handleEdit}
              className='admin-button admin-button-primary'
              disabled={!slug || !label}
            >
              儲存變更
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <div className='grid gap-2'>
      <label className='text-xs font-medium text-[color:var(--admin-text-muted)]'>{label}</label>
      <input
        type='text'
        value={value}
        onChange={e => onChange(e.target.value)}
        className='admin-input'
        placeholder={placeholder}
      />
    </div>
  )
}
