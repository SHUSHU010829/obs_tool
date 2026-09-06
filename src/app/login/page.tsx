'use client'

import { FormEvent, Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.message || '登入失敗')
        return
      }

      const next = searchParams.get('next')
      const target = next && next.startsWith('/') ? next : '/'
      router.push(target)
      router.refresh()
    } catch {
      setError('無法連線到伺服器，請稍後再試')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='admin-shell flex min-h-screen items-center justify-center p-4'>
      <div className='admin-card w-full max-w-sm'>
        <div className='admin-card-content py-8'>
          <h1 className='mb-1 text-lg font-semibold text-[color:var(--admin-text)]'>
            OBS 後台管理
          </h1>
          <p className='mb-6 text-xs text-[color:var(--admin-text-subtle)]'>請登入以繼續</p>

          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <div className='grid gap-2'>
              <label
                htmlFor='username'
                className='text-xs font-medium text-[color:var(--admin-text-muted)]'
              >
                帳號
              </label>
              <input
                id='username'
                type='text'
                autoFocus
                value={username}
                onChange={e => setUsername(e.target.value)}
                className='admin-input'
                autoComplete='username'
              />
            </div>
            <div className='grid gap-2'>
              <label
                htmlFor='password'
                className='text-xs font-medium text-[color:var(--admin-text-muted)]'
              >
                密碼
              </label>
              <input
                id='password'
                type='password'
                value={password}
                onChange={e => setPassword(e.target.value)}
                className='admin-input'
                autoComplete='current-password'
              />
            </div>

            {error && (
              <p className='text-xs text-[color:var(--admin-state-live)]'>{error}</p>
            )}

            <button
              type='submit'
              disabled={submitting || !username || !password}
              className='admin-button admin-button-primary mt-2 w-full'
            >
              {submitting ? '登入中…' : '登入'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
