'use client'

import { useEffect, useState } from 'react'

import { getPendingRequests } from '@/api/songRequest'

const POLL_INTERVAL_MS = 15_000

export function usePendingRequests() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    const poll = async () => {
      try {
        const res = await getPendingRequests()
        if (!cancelled) setCount((res.data || []).length)
      } catch {
        if (!cancelled) setCount(0)
      }
    }

    poll()
    const id = setInterval(poll, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  return count
}
