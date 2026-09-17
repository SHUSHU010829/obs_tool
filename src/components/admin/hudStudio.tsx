'use client'

import { LAYOUT_META } from '@/app/nowplaying/layouts'
import { VISUALIZERS } from '@/app/nowplaying/visualizers'
import {
  HUD_DEFAULTS,
  HUD_FONTS,
  HudConfig,
  serializeHudConfig,
} from '@/lib/nowplaying/config'
import {
  describeStatus,
  isFailureStatus,
  type SpotifyPlaybackState,
} from '@/lib/nowplaying/types'
import { Copy, ExternalLink, RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

const PRESET_COLORS = ['auto', '#00ff87', '#00e5ff', '#ff2d95', '#a855f7', '#ffb020']

type SliderProps = {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  format?: (value: number) => string
}

function Slider({ label, value, min, max, step, onChange, format }: SliderProps) {
  return (
    <label className='block space-y-1.5'>
      <span className='flex items-center justify-between text-[12.5px] text-[var(--admin-text-muted)]'>
        <span>{label}</span>
        <span className='font-medium text-[var(--admin-text)]'>
          {format ? format(value) : value}
        </span>
      </span>
      <input
        type='range'
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className='w-full accent-[var(--admin-text)]'
      />
    </label>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className='flex cursor-pointer items-center justify-between gap-3 text-[12.5px] text-[var(--admin-text-muted)]'>
      <span>{label}</span>
      <input
        type='checkbox'
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className='h-4 w-4 accent-[var(--admin-text)]'
      />
    </label>
  )
}

/**
 * Visual editor for the Now Playing HUD. It only ever produces a query string —
 * there is no server-side state, so several OBS sources can each carry their
 * own settings.
 */
export default function HudStudio() {
  const [config, setConfig] = useState<HudConfig>(HUD_DEFAULTS)
  const [origin, setOrigin] = useState('')
  const [previewWidth, setPreviewWidth] = useState(0)
  const [playback, setPlayback] = useState<SpotifyPlaybackState | null>(null)
  const previewBoxRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  // The preview renders at the overlay's real pixel size and is scaled down to
  // fit, so what you see matches the OBS source dimensions exactly.
  const measure = useCallback(() => {
    if (previewBoxRef.current) setPreviewWidth(previewBoxRef.current.clientWidth)
  }, [])

  useEffect(() => {
    measure()
    const el = previewBoxRef.current
    if (!el) return
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [measure])

  /**
   * Live Spotify connection status. The overlay stays silent on failures so it
   * never puts an error on stream, which means this panel is where the
   * operator finds out that (say) the refresh token has expired.
   */
  useEffect(() => {
    let cancelled = false

    const poll = async () => {
      try {
        const res = await fetch('/api/spotify/playback', { cache: 'no-store' })
        const data = (await res.json()) as SpotifyPlaybackState
        if (!cancelled) setPlayback(data)
      } catch {
        if (!cancelled) setPlayback(null)
      }
    }

    poll()
    const id = setInterval(poll, 5000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  const set = <K extends keyof HudConfig>(key: K, value: HudConfig[K]) =>
    setConfig(prev => ({ ...prev, [key]: value }))

  const query = useMemo(() => serializeHudConfig(config), [config])
  const overlayUrl = `${origin}/nowplaying${query ? `?${query}` : ''}`
  // The preview always runs in demo mode so it shows something even when
  // nothing is playing on Spotify.
  const previewUrl = `/nowplaying?${query ? `${query}&` : ''}demo=1`
  const meta = LAYOUT_META[config.layout] ?? LAYOUT_META.bar
  const previewScale = previewWidth > 0 ? Math.min(1, previewWidth / meta.width) : 1

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(overlayUrl)
      toast.success('已複製 Overlay 網址')
    } catch {
      toast.error('複製失敗，請手動選取網址')
    }
  }

  return (
    <div className='grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]'>
      {/* Controls */}
      <div className='admin-card'>
        <div className='admin-card-header'>
          <h3 className='admin-card-title'>HUD 設定</h3>
          <button
            className='admin-button admin-button-sm admin-button-ghost'
            onClick={() => setConfig(HUD_DEFAULTS)}
            title='回復預設值'
          >
            <RotateCcw size={13} />
            重設
          </button>
        </div>

        <div className='admin-card-content space-y-5'>
          <div className='space-y-1.5'>
            <span className='text-[12.5px] text-[var(--admin-text-muted)]'>版面</span>
            <div className='admin-segmented w-full'>
              {Object.entries(LAYOUT_META).map(([id, m]) => (
                <button
                  key={id}
                  onClick={() => set('layout', id)}
                  className={config.layout === id ? 'active' : ''}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className='space-y-1.5'>
            <span className='text-[12.5px] text-[var(--admin-text-muted)]'>
              視覺化樣式
            </span>
            <div className='admin-segmented w-full'>
              {Object.entries(VISUALIZERS).map(([id, v]) => (
                <button
                  key={id}
                  onClick={() => set('viz', id)}
                  className={config.viz === id ? 'active' : ''}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <div className='space-y-1.5'>
            <span className='text-[12.5px] text-[var(--admin-text-muted)]'>
              主色（auto = 取自專輯封面）
            </span>
            <div className='flex flex-wrap gap-2'>
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => set('color', c)}
                  title={c}
                  className={`h-7 rounded-[6px] border px-2 text-[11px] ${
                    config.color === c
                      ? 'border-[var(--admin-text)]'
                      : 'border-[var(--admin-border)]'
                  }`}
                  style={
                    c === 'auto'
                      ? undefined
                      : { background: c, color: 'transparent', width: 34 }
                  }
                >
                  {c === 'auto' ? 'auto' : ''}
                </button>
              ))}
              <input
                type='color'
                value={config.color === 'auto' ? '#00ff87' : config.color}
                onChange={e => set('color', e.target.value)}
                className='h-7 w-9 cursor-pointer rounded-[6px] border border-[var(--admin-border)] bg-transparent'
                title='自訂色彩'
              />
            </div>
          </div>

          <div className='space-y-1.5'>
            <span className='text-[12.5px] text-[var(--admin-text-muted)]'>字體</span>
            <select
              className='admin-input w-full'
              value={config.font}
              onChange={e => set('font', e.target.value as HudConfig['font'])}
            >
              {HUD_FONTS.map(f => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div className='space-y-3'>
            <Slider
              label='透明度'
              value={config.opacity}
              min={0.1}
              max={1}
              step={0.05}
              onChange={v => set('opacity', v)}
              format={v => `${Math.round(v * 100)}%`}
            />
            <Slider
              label='Glow 強度'
              value={config.glow}
              min={0}
              max={2}
              step={0.1}
              onChange={v => set('glow', v)}
              format={v => `${v.toFixed(1)}×`}
            />
            <Slider
              label='動畫速度'
              value={config.speed}
              min={0.1}
              max={3}
              step={0.1}
              onChange={v => set('speed', v)}
              format={v => `${v.toFixed(1)}×`}
            />
            <Slider
              label='波形數量'
              value={config.barCount}
              min={8}
              max={192}
              step={4}
              onChange={v => set('barCount', v)}
            />
            <Slider
              label='FPS 上限'
              value={config.fps}
              min={15}
              max={60}
              step={5}
              onChange={v => set('fps', v)}
            />
          </div>

          <div className='space-y-2 border-t border-[var(--admin-border)] pt-4'>
            <Toggle
              label='顯示專輯封面'
              checked={config.showArtwork}
              onChange={v => set('showArtwork', v)}
            />
            <Toggle
              label='掃描線'
              checked={config.showScanlines}
              onChange={v => set('showScanlines', v)}
            />
            <Toggle
              label='格線'
              checked={config.showGrid}
              onChange={v => set('showGrid', v)}
            />
            <Toggle
              label='沒播放時顯示待機狀態'
              checked={config.standby}
              onChange={v => set('standby', v)}
            />
            <Toggle
              label='顯示診斷訊息（勿用於直播）'
              checked={config.debug}
              onChange={v => set('debug', v)}
            />
          </div>
        </div>
      </div>

      {/* Preview + URL */}
      <div className='space-y-4'>
        <div className='admin-card'>
          <div className='admin-card-header'>
            <h3 className='admin-card-title'>Spotify 連線狀態</h3>
            <span
              className={`admin-pill ${
                playback === null
                  ? 'admin-pill--idle'
                  : isFailureStatus(playback.status)
                    ? 'admin-pill--warn'
                    : playback.status === 'ok'
                      ? 'admin-pill--ok'
                      : 'admin-pill--idle'
              }`}
            >
              {playback === null ? '檢查中…' : playback.status.toUpperCase()}
            </span>
          </div>
          <div className='admin-card-content'>
            <p className='text-[13px] text-[var(--admin-text)]'>
              {playback === null ? '正在讀取播放狀態…' : describeStatus(playback)}
            </p>
            {playback !== null && isFailureStatus(playback.status) && (
              <>
                <p className='admin-section-subtitle mt-1'>
                  overlay
                  在這個狀態下預設是空白的（避免直播出現錯誤畫面）。要在畫面上看到原因，
                  可在網址加上 <span className='admin-kbd'>?debug=1</span>。
                </p>
                {playback.status === 'auth_failed' && (
                  <p className='admin-section-subtitle mt-2'>
                    在本機執行 <span className='admin-kbd'>npm run spotify:auth</span>{' '}
                    重新授權，把新的 refresh token 貼到部署平台的{' '}
                    <span className='admin-kbd'>SPOTIFY_REFRESH_TOKEN</span>，然後
                    <strong>重新部署</strong>（只改環境變數不會套用到既有部署）。
                  </p>
                )}
                {playback.status === 'unconfigured' && (
                  <p className='admin-section-subtitle mt-2'>
                    在部署平台補上缺少的環境變數後<strong>重新部署</strong>。
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <div className='admin-card'>
          <div className='admin-card-header'>
            <h3 className='admin-card-title'>即時預覽</h3>
            <span className='admin-badge'>
              建議 {meta.width} × {meta.height}
            </span>
          </div>
          <div className='admin-card-content'>
            <div ref={previewBoxRef} className='w-full'>
              <div
                className='overflow-hidden rounded-[6px]'
                style={{
                  // Checkerboard makes the overlay's transparency obvious.
                  background:
                    'repeating-conic-gradient(#1b1f24 0% 25%, #23282e 0% 50%) 50% / 16px 16px',
                  width: meta.width * previewScale,
                  height: meta.height * previewScale,
                  maxWidth: '100%',
                }}
              >
                <iframe
                  key={config.layout}
                  src={previewUrl}
                  title='Now Playing HUD 預覽'
                  style={{
                    width: meta.width,
                    height: meta.height,
                    border: 0,
                    display: 'block',
                    transform: `scale(${previewScale})`,
                    transformOrigin: 'top left',
                  }}
                />
              </div>
            </div>
            <p className='admin-section-subtitle mt-2'>
              預覽使用 demo 模式的假曲目，因此沒有在播歌時也看得到效果。
            </p>
          </div>
        </div>

        <div className='admin-card'>
          <div className='admin-card-header'>
            <h3 className='admin-card-title'>OBS 瀏覽器來源網址</h3>
          </div>
          <div className='admin-card-content flex flex-wrap items-center gap-2'>
            <input className='admin-input min-w-0 flex-1' readOnly value={overlayUrl} />
            <button
              className='admin-button admin-button-primary admin-button-sm'
              onClick={copy}
            >
              <Copy size={13} />
              複製
            </button>
            <a
              className='admin-button admin-button-sm'
              href={overlayUrl || '#'}
              target='_blank'
              rel='noreferrer'
            >
              <ExternalLink size={13} />
              開啟
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
