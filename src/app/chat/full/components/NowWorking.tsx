'use client'

import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'chat-full-now-working'

export default function NowWorking() {
  const [value, setValue] = useState<string>('')
  const [hydrated, setHydrated] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) ?? ''
      setValue(stored)
    } catch {
      // ignore
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const startEdit = () => {
    setDraft(value)
    setEditing(true)
  }

  const commit = () => {
    const trimmed = draft.trim()
    setValue(trimmed)
    try {
      localStorage.setItem(STORAGE_KEY, trimmed)
    } catch {
      // ignore
    }
    setEditing(false)
  }

  const cancel = () => {
    setEditing(false)
  }

  return (
    <div className='flex items-center' style={{ gap: 10, minWidth: 0, flex: 1 }}>
      <span
        className='font-spaceMono uppercase'
        style={{
          fontSize: 9,
          letterSpacing: '0.2em',
          color: 'rgba(180,230,200,0.5)',
          flexShrink: 0,
        }}
      >
        Now Working
      </span>
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => {
            if (e.key === 'Enter') commit()
            else if (e.key === 'Escape') cancel()
          }}
          placeholder='寫點什麼...'
          maxLength={80}
          className='font-notoSans'
          style={{
            flex: 1,
            minWidth: 0,
            background: 'rgba(0,255,135,0.08)',
            border: '1px solid rgba(0,255,135,0.3)',
            color: '#d4f5e2',
            fontSize: 13,
            padding: '3px 8px',
            outline: 'none',
            letterSpacing: '0.03em',
          }}
        />
      ) : (
        <button
          type='button'
          onClick={startEdit}
          className='font-notoSans'
          style={{
            flex: 1,
            minWidth: 0,
            textAlign: 'left',
            background: 'transparent',
            border: '1px dashed rgba(0,255,135,0.18)',
            color: hydrated && value ? '#d4f5e2' : 'rgba(180,230,200,0.35)',
            fontSize: 13,
            padding: '3px 8px',
            cursor: 'text',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            letterSpacing: '0.03em',
          }}
          title='點擊編輯工作狀態'
        >
          {hydrated ? (value || '—') : '—'}
        </button>
      )}
    </div>
  )
}
