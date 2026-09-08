'use client'

import { getMsgBoard } from '@/api/messageBoard'
import { getRepertoireList } from '@/api/repertoire'
import { getActiveSongs } from '@/api/song'
import { getPendingRequests } from '@/api/songRequest'
import { useCallback, useEffect, useState } from 'react'

const POLL_INTERVAL_MS = 15_000

/**
 * `null` means "we could not read this number", which the UI renders as a dash
 * rather than a misleading 0.
 */
export interface DashboardStats {
  playlist: number | null
  pending: number | null
  repertoire: number | null
  unreplied: number | null
}

const EMPTY: DashboardStats = {
  playlist: null,
  pending: null,
  repertoire: null,
  unreplied: null,
}

async function count(load: () => Promise<{ data: unknown }>) {
  try {
    const res = await load()
    return Array.isArray(res.data) ? res.data.length : null
  } catch {
    return null
  }
}

/**
 * Polls the four headline numbers shown on the dashboard. Every field fails
 * independently so one dead endpoint does not blank out the whole strip.
 */
export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>(EMPTY)

  const refresh = useCallback(async (): Promise<DashboardStats> => {
    const [playlist, pending, repertoire, unreplied] = await Promise.all([
      count(() => getActiveSongs()),
      count(() => getPendingRequests()),
      count(() => getRepertoireList()),
      (async () => {
        try {
          const res = await getMsgBoard()
          const rows = res.data
          if (!Array.isArray(rows)) return null
          return rows.filter(
            (row: { reply_message: string | null }) => !row.reply_message
          ).length
        } catch {
          return null
        }
      })(),
    ])
    return { playlist, pending, repertoire, unreplied }
  }, [])

  useEffect(() => {
    let cancelled = false

    const poll = async () => {
      const next = await refresh()
      if (!cancelled) setStats(next)
    }

    poll()
    const id = setInterval(poll, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [refresh])

  return stats
}
