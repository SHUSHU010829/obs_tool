'use client'

import MessageBoard from '@/components/admin/messageBoard'
import SongBook from '@/components/admin/songBook'
import SongList from '@/components/admin/songList'
import { useState } from 'react'
import { HamburgerMenuIcon, Cross1Icon } from '@radix-ui/react-icons'

type NavSection = 'songs' | 'messages'
type SongTab = 'songList' | 'songBook'

export default function Home() {
  const [activeSection, setActiveSection] = useState<NavSection>('songs')
  const [activeSongTab, setActiveSongTab] = useState<SongTab>('songList')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="eink-admin flex min-h-screen flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[var(--eink-border-strong)] bg-[var(--eink-bg-secondary)] p-4 md:hidden">
        <h1 className="font-eink-sans text-lg font-bold tracking-tight">OBS 後台管理</h1>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-eink border border-[var(--eink-border-strong)]"
        >
          {mobileMenuOpen ? (
            <Cross1Icon className="h-5 w-5" />
          ) : (
            <HamburgerMenuIcon className="h-5 w-5" />
          )}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[57px] z-40 bg-[var(--eink-bg-secondary)] md:hidden">
          <nav className="flex flex-col">
            <div className="border-b border-[var(--eink-border-subtle)] px-4 py-3">
              <span className="font-eink-sans text-xs font-semibold uppercase tracking-wider text-[var(--eink-text-muted)]">
                歌曲管理
              </span>
            </div>
            <button
              onClick={() => {
                setActiveSection('songs')
                setActiveSongTab('songList')
                setMobileMenuOpen(false)
              }}
              className={`eink-nav-item w-full text-left ${
                activeSection === 'songs' && activeSongTab === 'songList' ? 'active' : ''
              }`}
            >
              歌單 Playlist
            </button>
            <button
              onClick={() => {
                setActiveSection('songs')
                setActiveSongTab('songBook')
                setMobileMenuOpen(false)
              }}
              className={`eink-nav-item w-full text-left ${
                activeSection === 'songs' && activeSongTab === 'songBook' ? 'active' : ''
              }`}
            >
              歌本 Song Book
            </button>

            <div className="border-b border-[var(--eink-border-subtle)] px-4 py-3">
              <span className="font-eink-sans text-xs font-semibold uppercase tracking-wider text-[var(--eink-text-muted)]">
                互動功能
              </span>
            </div>
            <button
              onClick={() => {
                setActiveSection('messages')
                setMobileMenuOpen(false)
              }}
              className={`eink-nav-item w-full text-left ${
                activeSection === 'messages' ? 'active' : ''
              }`}
            >
              留言板 Messages
            </button>
          </nav>
        </div>
      )}

      {/* Desktop Sidebar Navigation */}
      <aside className="eink-sidebar relative hidden w-64 flex-shrink-0 md:block">
        <div className="border-b border-[var(--eink-border-strong)] p-6">
          <h1 className="font-eink-sans text-xl font-bold tracking-tight">
            OBS 後台管理
          </h1>
          <p className="mt-1 font-eink-serif text-sm text-[var(--eink-text-muted)]">
            Dashboard
          </p>
        </div>

        <nav className="py-4">
          <div className="px-4 pb-2">
            <span className="font-eink-sans text-xs font-semibold uppercase tracking-wider text-[var(--eink-text-muted)]">
              歌曲管理
            </span>
          </div>
          <button
            onClick={() => {
              setActiveSection('songs')
              setActiveSongTab('songList')
            }}
            className={`eink-nav-item w-full text-left ${
              activeSection === 'songs' && activeSongTab === 'songList' ? 'active' : ''
            }`}
          >
            歌單 Playlist
          </button>
          <button
            onClick={() => {
              setActiveSection('songs')
              setActiveSongTab('songBook')
            }}
            className={`eink-nav-item w-full text-left ${
              activeSection === 'songs' && activeSongTab === 'songBook' ? 'active' : ''
            }`}
          >
            歌本 Song Book
          </button>

          <div className="mt-6 px-4 pb-2">
            <span className="font-eink-sans text-xs font-semibold uppercase tracking-wider text-[var(--eink-text-muted)]">
              互動功能
            </span>
          </div>
          <button
            onClick={() => setActiveSection('messages')}
            className={`eink-nav-item w-full text-left ${
              activeSection === 'messages' ? 'active' : ''
            }`}
          >
            留言板 Messages
          </button>
        </nav>

        {/* Footer Info */}
        <div className="absolute bottom-0 w-64 border-t border-[var(--eink-border-subtle)] p-4">
          <p className="font-eink-sans text-xs text-[var(--eink-text-muted)]">
            E-ink Style Dashboard
          </p>
          <p className="font-eink-sans text-xs text-[var(--eink-text-muted)]">v1.0.0</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          {activeSection === 'songs' && (
            <>
              {/* Section Header */}
              <header className="mb-8">
                <h2 className="eink-section-title">
                  {activeSongTab === 'songList' ? '歌單管理' : '歌本管理'}
                </h2>
                <p className="eink-section-subtitle">
                  {activeSongTab === 'songList'
                    ? '管理目前的播放歌單，可新增、編輯或刪除歌曲'
                    : '管理歌曲類型與分類'}
                </p>
              </header>

              {/* Song Section Tabs */}
              <div className="mb-6 flex border-b border-[var(--eink-border-strong)]">
                <button
                  onClick={() => setActiveSongTab('songList')}
                  className={`font-eink-sans border-b-2 px-6 py-3 text-sm font-medium transition-all duration-eink-fast ease-eink ${
                    activeSongTab === 'songList'
                      ? 'border-[var(--eink-border-strong)] text-[var(--eink-text-primary)]'
                      : 'border-transparent text-[var(--eink-text-muted)] hover:text-[var(--eink-text-secondary)]'
                  }`}
                >
                  歌單
                </button>
                <button
                  onClick={() => setActiveSongTab('songBook')}
                  className={`font-eink-sans border-b-2 px-6 py-3 text-sm font-medium transition-all duration-eink-fast ease-eink ${
                    activeSongTab === 'songBook'
                      ? 'border-[var(--eink-border-strong)] text-[var(--eink-text-primary)]'
                      : 'border-transparent text-[var(--eink-text-muted)] hover:text-[var(--eink-text-secondary)]'
                  }`}
                >
                  歌本
                </button>
              </div>

              {/* Song Content */}
              {activeSongTab === 'songList' && <SongList />}
              {activeSongTab === 'songBook' && <SongBook />}
            </>
          )}

          {activeSection === 'messages' && (
            <>
              {/* Section Header */}
              <header className="mb-8">
                <h2 className="eink-section-title">留言板</h2>
                <p className="eink-section-subtitle">查看並管理觀眾留言與回覆</p>
              </header>

              {/* Message Board Content */}
              <MessageBoard />
            </>
          )}
        </div>
      </main>
    </div>
  )
}
