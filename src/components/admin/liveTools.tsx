'use client'

import { Copy, ExternalLink, Eye, EyeOff, StarIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

type Category = 'all' | 'chat' | 'media' | 'clock'

interface OverlayEntry {
  id: string
  name: string
  description: string
  path: string
  category: Exclude<Category, 'all'>
  recommended?: boolean
  hint?: string
}

const OVERLAYS: OverlayEntry[] = [
  {
    id: 'chat',
    name: '聊天室 Compact',
    description: '最簡潔的直式聊天欄，適合貼在畫面側邊。',
    path: '/chat',
    category: 'chat',
    recommended: true,
    hint: '建議寬 360 × 高 680',
  },
  {
    id: 'chat-full',
    name: '聊天室 Full HUD',
    description: '完整 HUD：左側 stats、中間聊天、右側 Spotify / 活動。',
    path: '/chat/full',
    category: 'chat',
    recommended: true,
    hint: '建議 1280 × 720 或更大',
  },
  {
    id: 'song',
    name: '歌曲資訊',
    description: '旋轉黑膠 + 當前播放歌曲資訊。',
    path: '/song',
    category: 'media',
  },
  {
    id: 'video',
    name: '背景影片',
    description: '全螢幕影片容器，適合當開播背景。',
    path: '/video',
    category: 'media',
  },
  {
    id: 'clock-all',
    name: '時鐘 (All)',
    description: '同時顯示指針式與數字時鐘。',
    path: '/clock?style=all',
    category: 'clock',
  },
  {
    id: 'clock-digital',
    name: '時鐘 Digital',
    description: '純數字時鐘，便於角落擺放。',
    path: '/clock?style=digital',
    category: 'clock',
  },
  {
    id: 'clock-simple',
    name: '時鐘 Simple',
    description: '單一指針時鐘樣式。',
    path: '/clock?style=simple',
    category: 'clock',
  },
]

const CATEGORY_LABELS: Record<Category, string> = {
  all: '全部',
  chat: '聊天',
  media: '多媒體',
  clock: '時鐘',
}

type PreviewSize = 'compact' | 'full' | 'free'

const PREVIEW_SIZES: Record<PreviewSize, { label: string; w: number; h: number }> = {
  compact: { label: 'Compact 360×680', w: 360, h: 680 },
  full: { label: 'Full 1280×720', w: 1280, h: 720 },
  free: { label: '自適應', w: 0, h: 0 },
}

async function copyUrl(path: string, origin: string) {
  const url = `${origin}${path}`
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(url)
    } else {
      const el = document.createElement('textarea')
      el.value = url
      el.setAttribute('readonly', '')
      el.style.position = 'absolute'
      el.style.left = '-9999px'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    toast.success('已複製連結', { description: url })
  } catch {
    toast.error('複製失敗，請手動複製', { description: url })
  }
}

export default function LiveTools() {
  const [category, setCategory] = useState<Category>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [previewSize, setPreviewSize] = useState<PreviewSize>('compact')
  const [origin, setOrigin] = useState<string>('')

  useEffect(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin)
  }, [])

  const filtered = useMemo(
    () => (category === 'all' ? OVERLAYS : OVERLAYS.filter(o => o.category === category)),
    [category]
  )

  const selected = useMemo(
    () => OVERLAYS.find(o => o.id === selectedId) ?? null,
    [selectedId]
  )

  const handlePreview = (entry: OverlayEntry) => {
    if (selectedId === entry.id) {
      setSelectedId(null)
      return
    }
    setSelectedId(entry.id)
    // Pick a sensible default size
    if (entry.id === 'chat-full') setPreviewSize('full')
    else if (entry.category === 'chat') setPreviewSize('compact')
    else setPreviewSize('free')
  }

  return (
    <div className='grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]'>
      {/* Left: overlay cards */}
      <div className='space-y-4'>
        <div className='admin-segmented'>
          {(Object.keys(CATEGORY_LABELS) as Category[]).map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={category === c ? 'active' : ''}
            >
              {CATEGORY_LABELS[c]}
              {c !== 'all' && (
                <span className='ml-1 text-[color:var(--admin-text-subtle)]'>
                  {OVERLAYS.filter(o => o.category === c).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className='space-y-3'>
          {filtered.map(entry => {
            const fullUrl = origin ? `${origin}${entry.path}` : entry.path
            const isSelected = selectedId === entry.id
            return (
              <div
                key={entry.id}
                className={`admin-card admin-card--interactive ${isSelected ? 'admin-card--selected' : ''}`}
              >
                <div className='admin-card-content'>
                  <div className='flex items-start justify-between gap-3'>
                    <div className='min-w-0 flex-1'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <h3 className='admin-card-title'>{entry.name}</h3>
                        {entry.recommended && (
                          <span className='admin-badge admin-badge--accent'>
                            <StarIcon className='h-3 w-3' />
                            常用
                          </span>
                        )}
                        <span className='admin-badge'>{CATEGORY_LABELS[entry.category]}</span>
                      </div>
                      <p className='mt-1.5 text-[13px] leading-relaxed text-[color:var(--admin-text-muted)]'>
                        {entry.description}
                      </p>
                      {entry.hint && (
                        <p className='mt-1 text-[11.5px] text-[color:var(--admin-text-subtle)]'>
                          {entry.hint}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className='admin-url mt-3 rounded-md bg-[color:var(--admin-bg)] px-2.5 py-1.5'>
                    {fullUrl}
                  </div>

                  <div className='mt-3 flex flex-wrap gap-2'>
                    <button
                      onClick={() => copyUrl(entry.path, origin)}
                      className='admin-button admin-button-primary admin-button-sm'
                    >
                      <Copy className='h-3.5 w-3.5' />
                      複製連結
                    </button>
                    <button
                      onClick={() => handlePreview(entry)}
                      className='admin-button admin-button-sm'
                    >
                      {isSelected ? (
                        <>
                          <EyeOff className='h-3.5 w-3.5' />
                          關閉預覽
                        </>
                      ) : (
                        <>
                          <Eye className='h-3.5 w-3.5' />
                          預覽
                        </>
                      )}
                    </button>
                    <a
                      href={entry.path}
                      target='_blank'
                      rel='noreferrer noopener'
                      className='admin-button admin-button-ghost admin-button-sm'
                    >
                      <ExternalLink className='h-3.5 w-3.5' />
                      新分頁開啟
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className='admin-card'>
              <div className='admin-card-content text-center text-sm text-[color:var(--admin-text-muted)]'>
                此分類沒有項目
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: preview panel */}
      <div className='admin-card lg:sticky lg:top-6 lg:self-start'>
        <div className='admin-card-header'>
          <div className='min-w-0'>
            <div className='admin-card-title truncate'>
              {selected ? selected.name : '預覽面板'}
            </div>
            <div className='admin-url mt-0.5 truncate'>
              {selected ? `${origin}${selected.path}` : '選擇左側任一 overlay 開始預覽'}
            </div>
          </div>
          {selected && (
            <div className='admin-segmented shrink-0'>
              {(Object.keys(PREVIEW_SIZES) as PreviewSize[]).map(s => (
                <button
                  key={s}
                  onClick={() => setPreviewSize(s)}
                  className={previewSize === s ? 'active' : ''}
                  title={PREVIEW_SIZES[s].label}
                >
                  {s === 'compact' ? 'S' : s === 'full' ? 'L' : 'Fit'}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className='admin-card-content'>
          {selected ? (
            <PreviewFrame
              key={selected.id}
              src={selected.path}
              size={previewSize}
              label={PREVIEW_SIZES[previewSize].label}
            />
          ) : (
            <div className='flex min-h-[360px] items-center justify-center rounded-md border border-dashed border-[color:var(--admin-border)] bg-[color:var(--admin-bg)] text-sm text-[color:var(--admin-text-subtle)]'>
              點擊左側「預覽」以載入 iframe
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PreviewFrame({
  src,
  size,
  label,
}: {
  src: string
  size: PreviewSize
  label: string
}) {
  const { w, h } = PREVIEW_SIZES[size]
  const isFree = size === 'free'

  return (
    <div>
      <div
        className='relative overflow-auto rounded-md border border-[color:var(--admin-border)] bg-black'
        style={{ maxHeight: '70vh' }}
      >
        <div
          style={{
            width: isFree ? '100%' : w,
            height: isFree ? '60vh' : h,
            transformOrigin: 'top left',
          }}
          className={isFree ? 'mx-auto' : ''}
        >
          <iframe
            src={src}
            title='overlay preview'
            className='h-full w-full border-0 bg-transparent'
            sandbox='allow-scripts allow-same-origin'
          />
        </div>
      </div>
      <div className='mt-2 flex items-center justify-between text-[11.5px] text-[color:var(--admin-text-subtle)]'>
        <span>{label}</span>
        <span>只載入此一個 iframe · 切換會重新掛載</span>
      </div>
    </div>
  )
}
