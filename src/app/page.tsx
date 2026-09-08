'use client'

import LiveTools from '@/components/admin/liveTools'
import MessageBoard from '@/components/admin/messageBoard'
import SongArchive from '@/components/admin/songArchive'
import SongBook from '@/components/admin/songBook'
import SongList from '@/components/admin/songList'
import SongRequests from '@/components/admin/songRequests'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import {
  Clock,
  Disc3,
  ExternalLink,
  Inbox,
  ListMusic,
  LogOut,
  Menu,
  MessageSquare,
  MonitorPlay,
  Radio,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

type NavSection = 'songs' | 'messages' | 'livetools'
type SongTab = 'songList' | 'songBook' | 'songRequest' | 'archive'
type Tone = 'violet' | 'pink' | 'blue' | 'green'

const SECTION_META: Record<NavSection, { label: string; subtitle: string }> = {
  songs: { label: '歌曲管理', subtitle: '' },
  messages: { label: '留言板', subtitle: '查看並管理觀眾留言與回覆' },
  livetools: { label: '直播工具', subtitle: '' },
}

const SONG_TAB_META: Record<SongTab, { label: string; subtitle: string }> = {
  songList: { label: '歌單', subtitle: '管理目前的播放歌單，可新增、編輯或刪除歌曲' },
  songBook: { label: '歌本', subtitle: '管理主播會唱的歌曲與分類' },
  songRequest: { label: '點歌審核', subtitle: '審核觀眾送出的點歌請求' },
  archive: { label: '歷史紀錄', subtitle: '查看並恢復已封存的歌曲' },
}

const SONG_TAB_ORDER: SongTab[] = ['songList', 'songBook', 'songRequest', 'archive']

const QUICK_LINKS: { label: string; path: string; icon: typeof Clock; tone: Tone }[] = [
  { label: '聊天室 Full HUD', path: '/chat/full', icon: MonitorPlay, tone: 'violet' },
  { label: '聊天室 Compact', path: '/chat', icon: MessageSquare, tone: 'blue' },
  { label: '歌曲資訊', path: '/song', icon: Disc3, tone: 'pink' },
  { label: '時鐘', path: '/clock?style=all', icon: Clock, tone: 'green' },
]

const TONE_CLASS: Record<Tone, string> = {
  violet: '',
  pink: 'admin-tile--pink',
  blue: 'admin-tile--blue',
  green: 'admin-tile--green',
}

/** `null` counts come from a failed fetch and render as a dash, not a fake 0. */
function formatCount(value: number | null) {
  return value === null ? '—' : String(value)
}

export default function Home() {
  const [activeSection, setActiveSection] = useState<NavSection>('songs')
  const [activeSongTab, setActiveSongTab] = useState<SongTab>('songList')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [debugMode, setDebugMode] = useState(false)
  const stats = useDashboardStats()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  useEffect(() => {
    const stored = localStorage.getItem('obs-debug-mode')
    if (stored === 'true') setDebugMode(true)
  }, [])

  const toggleDebugMode = () => {
    setDebugMode(prev => {
      const next = !prev
      localStorage.setItem('obs-debug-mode', String(next))
      return next
    })
  }

  const go = (section: NavSection, songTab?: SongTab) => {
    setActiveSection(section)
    if (songTab) setActiveSongTab(songTab)
    setMobileMenuOpen(false)
  }

  const pending = stats.pending ?? 0
  const hasPending = pending > 0
  // Three states: unknown (fetch failed / still loading), needs attention, clear.
  const statusTone = stats.pending === null ? 'idle' : hasPending ? 'warn' : 'ok'
  const statusLabel =
    stats.pending === null
      ? '資料讀取中'
      : hasPending
        ? `${pending} 筆待審核`
        : '沒有待辦'

  // Only mention the numbers we actually have, so a dead endpoint does not
  // render as "— 首待唱 · — 則未回覆".
  const heroFacts = [
    stats.playlist !== null ? `${stats.playlist} 首待唱` : null,
    stats.unreplied !== null ? `${stats.unreplied} 則未回覆` : null,
  ].filter((fact): fact is string => fact !== null)

  const navItems: {
    key: NavSection
    label: string
    icon: typeof Clock
    badge?: number
  }[] = [
    { key: 'songs', label: '歌曲管理', icon: ListMusic, badge: pending },
    {
      key: 'messages',
      label: '留言板',
      icon: MessageSquare,
      badge: stats.unreplied ?? 0,
    },
    { key: 'livetools', label: '直播工具', icon: SlidersHorizontal },
  ]

  const renderNav = () => (
    <nav className='flex flex-col gap-3 py-2'>
      <div>
        <div className='px-4 pb-1'>
          <span className='admin-nav-group-label'>主選單</span>
        </div>
        {navItems.map(item => {
          const Icon = item.icon
          return (
            <button
              key={item.key}
              onClick={() => go(item.key)}
              className={`admin-nav-item ${activeSection === item.key ? 'active' : ''}`}
            >
              <Icon className='h-4 w-4 shrink-0' />
              <span className='flex-1 truncate text-left'>{item.label}</span>
              {!!item.badge && (
                <span className='admin-badge admin-badge--warn shrink-0'>
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div>
        <div className='px-4 pb-1'>
          <span className='admin-nav-group-label'>直播畫面</span>
        </div>
        {QUICK_LINKS.map(link => {
          const Icon = link.icon
          return (
            <a
              key={link.path}
              href={link.path}
              target='_blank'
              rel='noreferrer'
              className='admin-nav-item group'
            >
              <span className={`admin-tile ${TONE_CLASS[link.tone]}`}>
                <Icon className='h-3.5 w-3.5' />
              </span>
              <span className='flex-1 truncate text-left'>{link.label}</span>
              <ExternalLink className='h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-60' />
            </a>
          )
        })}
      </div>
    </nav>
  )

  const renderSidebarFooter = () => (
    <div className='border-t border-[color:var(--admin-border)] p-3'>
      <div className='flex gap-2'>
        <button
          onClick={toggleDebugMode}
          className={`admin-button admin-button-sm flex-1 ${debugMode ? 'admin-button-primary' : ''}`}
        >
          <span className='mr-1 text-[10px] uppercase tracking-wider opacity-70'>
            Debug
          </span>
          {debugMode ? 'ON' : 'OFF'}
        </button>
        <button
          onClick={handleLogout}
          className='admin-button admin-button-ghost admin-button-sm'
          aria-label='登出'
        >
          <LogOut className='h-3.5 w-3.5' />
          登出
        </button>
      </div>
      <p className='mt-2 text-[10.5px] text-[color:var(--admin-text-subtle)]'>
        OBS Tool · v1.1.0
      </p>
    </div>
  )

  const breadcrumbTail =
    activeSection === 'songs'
      ? SONG_TAB_META[activeSongTab].label
      : SECTION_META[activeSection].label

  const contentSubtitle =
    activeSection === 'songs'
      ? SONG_TAB_META[activeSongTab].subtitle
      : SECTION_META[activeSection].subtitle

  return (
    <div className='admin-shell flex min-h-screen flex-col md:flex-row'>
      {/* Mobile header */}
      <header className='admin-sidebar sticky top-0 z-50 flex h-14 items-center justify-between px-3 md:hidden'>
        <div className='flex min-w-0 items-center gap-2.5'>
          <span className='admin-brand-mark'>
            <Radio className='h-4 w-4' />
          </span>
          <div className='min-w-0'>
            <p className='truncate text-[13.5px] font-semibold leading-tight'>
              OBS 後台管理
            </p>
            <p className='truncate text-[10.5px] leading-tight text-[color:var(--admin-text-subtle)]'>
              Streaming Dashboard
            </p>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className='admin-button admin-button-ghost admin-button-sm'
          aria-label='Toggle menu'
        >
          {mobileMenuOpen ? <X className='h-4 w-4' /> : <Menu className='h-4 w-4' />}
        </button>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className='admin-sidebar fixed inset-x-0 bottom-0 top-14 z-40 flex flex-col overflow-y-auto md:hidden'>
          <div className='flex-1'>{renderNav()}</div>
          {renderSidebarFooter()}
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className='admin-sidebar sticky top-0 hidden h-screen w-56 flex-shrink-0 self-start overflow-y-auto md:flex md:flex-col'>
        <div className='flex items-center gap-2.5 px-4 py-3'>
          <span className='admin-brand-mark'>
            <Radio className='h-4 w-4' />
          </span>
          <div className='min-w-0'>
            <p className='truncate text-[13.5px] font-semibold leading-tight'>
              OBS 後台管理
            </p>
            <p className='truncate text-[10.5px] leading-tight text-[color:var(--admin-text-subtle)]'>
              Streaming Dashboard
            </p>
          </div>
        </div>
        <div className='border-t border-[color:var(--admin-border)]' />
        <div className='flex-1'>{renderNav()}</div>
        {renderSidebarFooter()}
      </aside>

      {/* Main content */}
      <main className='min-w-0 flex-1 px-3 py-3 md:px-5 md:py-4'>
        <div className='mx-auto flex max-w-6xl flex-col gap-3'>
          {/* Breadcrumb */}
          <div className='admin-breadcrumb'>
            <span>首頁</span>
            <span className='sep'>›</span>
            <span>{SECTION_META[activeSection].label}</span>
            {activeSection === 'songs' && (
              <>
                <span className='sep'>›</span>
                <span className='current'>{breadcrumbTail}</span>
              </>
            )}
          </div>

          {/* Hero */}
          <section className='admin-hero'>
            <div className='flex items-start gap-3'>
              <span className='admin-hero-mark'>
                <Radio className='h-5 w-5' />
              </span>
              <div className='min-w-0 flex-1'>
                <div className='flex flex-wrap items-center gap-x-2 gap-y-1'>
                  <span className={`admin-pill admin-pill--${statusTone}`}>
                    <span className='dot' />
                    {statusLabel}
                  </span>
                  {heroFacts.length > 0 && (
                    <span className='text-[11.5px] text-[#54545f]'>
                      {heroFacts.join(' · ')}
                    </span>
                  )}
                </div>
                <h1 className='admin-hero-title mt-1.5'>OBS 後台管理</h1>
                <p className='admin-hero-desc mt-1'>
                  歌單、曲庫、點歌審核與留言板集中管理，overlay 連結可直接複製到 OBS
                  Browser Source。
                </p>
              </div>
            </div>
          </section>

          {/* Headline numbers */}
          <section className='admin-stats'>
            <Stat value={stats.playlist} label='歌單待唱' unit='首' />
            <Stat
              value={stats.pending}
              label='待審核點歌'
              unit='筆'
              highlight={hasPending}
            />
            <Stat value={stats.repertoire} label='曲庫歌曲' unit='首' />
            <Stat
              value={stats.unreplied}
              label='未回覆留言'
              unit='則'
              highlight={(stats.unreplied ?? 0) > 0}
            />
          </section>

          {/* Section content */}
          {activeSection === 'songs' ? (
            <div className='admin-tabs'>
              {SONG_TAB_ORDER.map(tab => {
                const count =
                  tab === 'songList'
                    ? stats.playlist
                    : tab === 'songBook'
                      ? stats.repertoire
                      : tab === 'songRequest'
                        ? stats.pending
                        : null
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveSongTab(tab)}
                    className={`admin-tab ${activeSongTab === tab ? 'active' : ''}`}
                  >
                    {SONG_TAB_META[tab].label}
                    {count !== null && (
                      <span
                        className={`admin-tab-count ${tab === 'songRequest' && count > 0 ? 'admin-tab-count--warn' : ''}`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className='flex items-center gap-2'>
              {activeSection === 'messages' ? (
                <Inbox className='h-4 w-4 text-[color:var(--admin-text-muted)]' />
              ) : (
                <SlidersHorizontal className='h-4 w-4 text-[color:var(--admin-text-muted)]' />
              )}
              <h2 className='admin-section-title !mb-0'>
                {SECTION_META[activeSection].label}
              </h2>
            </div>
          )}

          {contentSubtitle && (
            <p className='admin-section-subtitle -mt-1'>{contentSubtitle}</p>
          )}

          {activeSection === 'songs' && (
            <>
              {activeSongTab === 'songList' && <SongList />}
              {activeSongTab === 'songBook' && <SongBook />}
              {activeSongTab === 'songRequest' && <SongRequests />}
              {activeSongTab === 'archive' && <SongArchive />}
            </>
          )}

          {activeSection === 'messages' && <MessageBoard />}

          {activeSection === 'livetools' && (
            <>
              <p className='admin-section-subtitle -mt-1'>
                複製 OBS Browser Source 使用的 overlay 連結；點
                <span className='admin-kbd mx-1'>Preview</span>
                即時確認畫面，切換其他項目會自動卸載原 iframe 以避免累積連線。
              </p>
              <LiveTools />
            </>
          )}
        </div>
      </main>
    </div>
  )
}

function Stat({
  value,
  label,
  unit,
  highlight,
}: {
  value: number | null
  label: string
  unit: string
  highlight?: boolean
}) {
  return (
    <div className='admin-stat'>
      <p
        className='admin-stat-value'
        style={highlight ? { color: 'var(--admin-state-warn)' } : undefined}
      >
        {formatCount(value)}
        {value !== null && <span className='unit'>{unit}</span>}
      </p>
      <p className='admin-stat-label'>{label}</p>
    </div>
  )
}
