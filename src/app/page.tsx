'use client'

import LiveTools from '@/components/admin/liveTools'
import MessageBoard from '@/components/admin/messageBoard'
import SongArchive from '@/components/admin/songArchive'
import SongBook from '@/components/admin/songBook'
import SongList from '@/components/admin/songList'
import SongRequests from '@/components/admin/songRequests'
import { usePendingRequests } from '@/hooks/usePendingRequests'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { HamburgerMenuIcon, Cross1Icon, ExitIcon } from '@radix-ui/react-icons'

type NavSection = 'songs' | 'messages' | 'livetools'
type SongTab = 'songList' | 'songBook' | 'songRequest' | 'archive'

interface NavEntry {
  key: string
  label: string
  onClick: () => void
  isActive: boolean
  badge?: number
}

const SONG_TAB_META: Record<SongTab, { title: string; subtitle: string }> = {
  songList: { title: '歌單管理', subtitle: '管理目前的播放歌單，可新增、編輯或刪除歌曲' },
  songBook: { title: '曲庫管理', subtitle: '管理主播會唱的歌曲與分類' },
  songRequest: { title: '點歌審核', subtitle: '審核觀眾送出的點歌請求' },
  archive: { title: '歷史紀錄', subtitle: '查看並恢復已封存的歌曲' },
}

export default function Home() {
  const [activeSection, setActiveSection] = useState<NavSection>('songs')
  const [activeSongTab, setActiveSongTab] = useState<SongTab>('songList')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [debugMode, setDebugMode] = useState(false)
  const pendingRequestCount = usePendingRequests()
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

  const songGroup: NavEntry[] = [
    {
      key: 'songList',
      label: '歌單 Playlist',
      onClick: () => go('songs', 'songList'),
      isActive: activeSection === 'songs' && activeSongTab === 'songList',
    },
    {
      key: 'songBook',
      label: '歌本 Song Book',
      onClick: () => go('songs', 'songBook'),
      isActive: activeSection === 'songs' && activeSongTab === 'songBook',
    },
    {
      key: 'songRequest',
      label: '點歌審核',
      onClick: () => go('songs', 'songRequest'),
      isActive: activeSection === 'songs' && activeSongTab === 'songRequest',
      badge: pendingRequestCount,
    },
    {
      key: 'archive',
      label: '歷史紀錄',
      onClick: () => go('songs', 'archive'),
      isActive: activeSection === 'songs' && activeSongTab === 'archive',
    },
  ]

  const interactGroup: NavEntry[] = [
    {
      key: 'messages',
      label: '留言板 Messages',
      onClick: () => go('messages'),
      isActive: activeSection === 'messages',
    },
  ]

  const liveGroup: NavEntry[] = [
    {
      key: 'livetools',
      label: '直播工具 Live Tools',
      onClick: () => go('livetools'),
      isActive: activeSection === 'livetools',
    },
  ]

  const renderNav = () => (
    <nav className='flex flex-col gap-5 py-5'>
      <NavGroup title='歌曲管理' entries={songGroup} />
      <NavGroup title='互動功能' entries={interactGroup} />
      <NavGroup title='直播工具' entries={liveGroup} />
    </nav>
  )

  return (
    <div className='admin-shell flex min-h-screen flex-col md:flex-row'>
      {/* Mobile Header */}
      <header className='admin-sidebar sticky top-0 z-50 flex items-center justify-between p-4 md:hidden'>
        <div>
          <h1 className='text-base font-semibold tracking-tight'>OBS 後台管理</h1>
          <p className='text-[11px] text-[color:var(--admin-text-subtle)]'>Dashboard</p>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className='admin-button admin-button-ghost admin-button-sm'
          aria-label='Toggle menu'
        >
          {mobileMenuOpen ? (
            <Cross1Icon className='h-4 w-4' />
          ) : (
            <HamburgerMenuIcon className='h-4 w-4' />
          )}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className='admin-sidebar fixed inset-0 top-[65px] z-40 overflow-y-auto md:hidden'>
          {renderNav()}
          <div className='border-t border-[color:var(--admin-border)] px-4 py-4'>
            <DebugToggle debugMode={debugMode} onToggle={toggleDebugMode} />
            <button
              onClick={handleLogout}
              className='admin-button admin-button-ghost admin-button-sm mt-2 w-full'
            >
              <ExitIcon className='h-4 w-4' />
              登出
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className='admin-sidebar sticky top-0 hidden h-screen w-64 flex-shrink-0 self-start overflow-y-auto md:flex md:flex-col'>
        <div className='px-6 py-6'>
          <h1 className='text-lg font-semibold tracking-tight'>OBS 後台管理</h1>
          <p className='mt-1 text-xs text-[color:var(--admin-text-subtle)]'>Streaming Dashboard</p>
        </div>
        <div className='border-t border-[color:var(--admin-border)]' />
        {renderNav()}
        <div className='mt-auto border-t border-[color:var(--admin-border)] p-4'>
          <DebugToggle debugMode={debugMode} onToggle={toggleDebugMode} />
          <button
            onClick={handleLogout}
            className='admin-button admin-button-ghost admin-button-sm mt-2 w-full'
          >
            <ExitIcon className='h-4 w-4' />
            登出
          </button>
          <p className='mt-3 text-[11px] text-[color:var(--admin-text-subtle)]'>
            Neutral HUD · v1.1.0
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className='flex-1 p-4 md:p-8'>
        <div className='mx-auto max-w-6xl'>
          {activeSection === 'songs' && (
            <>
              <header className='mb-7'>
                <h2 className='admin-section-title'>{SONG_TAB_META[activeSongTab].title}</h2>
                <p className='admin-section-subtitle'>
                  {SONG_TAB_META[activeSongTab].subtitle}
                </p>
              </header>

              <div className='admin-segmented mb-5 flex-wrap'>
                <button
                  onClick={() => setActiveSongTab('songList')}
                  className={activeSongTab === 'songList' ? 'active' : ''}
                >
                  歌單
                </button>
                <button
                  onClick={() => setActiveSongTab('songBook')}
                  className={activeSongTab === 'songBook' ? 'active' : ''}
                >
                  歌本
                </button>
                <button
                  onClick={() => setActiveSongTab('songRequest')}
                  className={activeSongTab === 'songRequest' ? 'active' : ''}
                >
                  點歌審核{pendingRequestCount > 0 ? `（${pendingRequestCount}）` : ''}
                </button>
                <button
                  onClick={() => setActiveSongTab('archive')}
                  className={activeSongTab === 'archive' ? 'active' : ''}
                >
                  歷史紀錄
                </button>
              </div>

              {activeSongTab === 'songList' && <SongList />}
              {activeSongTab === 'songBook' && <SongBook />}
              {activeSongTab === 'songRequest' && <SongRequests />}
              {activeSongTab === 'archive' && <SongArchive />}
            </>
          )}

          {activeSection === 'messages' && (
            <>
              <header className='mb-7'>
                <h2 className='admin-section-title'>留言板</h2>
                <p className='admin-section-subtitle'>查看並管理觀眾留言與回覆</p>
              </header>
              <MessageBoard />
            </>
          )}

          {activeSection === 'livetools' && (
            <>
              <header className='mb-7'>
                <h2 className='admin-section-title'>直播工具</h2>
                <p className='admin-section-subtitle'>
                  複製 OBS Browser Source 使用的 overlay 連結；點
                  <span className='admin-kbd mx-1'>Preview</span>
                  即時確認畫面，切換其他項目會自動卸載原 iframe 以避免累積連線。
                </p>
              </header>
              <LiveTools />
            </>
          )}
        </div>
      </main>
    </div>
  )
}

function NavGroup({ title, entries }: { title: string; entries: NavEntry[] }) {
  return (
    <div>
      <div className='px-6 pb-2'>
        <span className='admin-nav-group-label'>{title}</span>
      </div>
      {entries.map(entry => (
        <button
          key={entry.key}
          onClick={entry.onClick}
          className={`admin-nav-item flex items-center justify-between gap-2 ${entry.isActive ? 'active' : ''}`}
        >
          <span>{entry.label}</span>
          {!!entry.badge && (
            <span className='admin-badge admin-badge--warn shrink-0'>{entry.badge}</span>
          )}
        </button>
      ))}
    </div>
  )
}

function DebugToggle({
  debugMode,
  onToggle,
}: {
  debugMode: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className={`admin-button admin-button-sm w-full ${debugMode ? 'admin-button-primary' : ''}`}
    >
      <span className='mr-1 text-xs uppercase tracking-wider opacity-70'>Debug</span>
      {debugMode ? 'ON' : 'OFF'}
    </button>
  )
}
