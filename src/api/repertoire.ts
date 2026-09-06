import axios from 'axios'

const BASE_URL = '/api/stream/repertoire'

export interface SongCategory {
  id: number
  create_time: string
  dimension: string
  slug: string
  label: string
  sort_order: number
}

export interface RepertoireSong {
  id: number
  create_time: string
  update_time: string
  song_title: string
  singer: string
  note: string | null
  status: number
  sort_order: number
  categories: SongCategory[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function request<T = any>(
  method: 'get' | 'post' | 'put' | 'delete',
  endpoint: string,
  data?: unknown,
  errorLabel?: string
) {
  try {
    return await axios.request<T>({ method, url: `${BASE_URL}${endpoint}`, data })
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(`${errorLabel ?? 'Error calling repertoire API'}: ${error.message}`)
    }
    throw new Error('Unknown error occurred')
  }
}

// ============================================
// 分類 API
// ============================================

export async function getCategories() {
  return request<SongCategory[]>('get', '/categories', undefined, 'Error fetching categories')
}

export async function createCategory(
  dimension: string,
  slug: string,
  label: string,
  sortOrder?: number
) {
  return request<SongCategory>(
    'post',
    '/categories',
    { dimension, slug, label, sort_order: sortOrder },
    'Error creating category'
  )
}

export async function updateCategory(
  id: number,
  updates: { label?: string; slug?: string; sort_order?: number }
) {
  return request('put', `/categories/${id}`, updates, 'Error updating category')
}

export async function deleteCategory(id: number) {
  return request('delete', `/categories/${id}`, undefined, 'Error deleting category')
}

// ============================================
// 曲庫 API
// ============================================

// 取得曲庫（預設只回上架中的，includeAll 帶 status=all 連下架的一起回）
export async function getRepertoireList(includeAll = false) {
  const endpoint = includeAll ? '?status=all' : ''
  return request<RepertoireSong[]>('get', endpoint, undefined, 'Error fetching repertoire')
}

export async function createRepertoire(
  songTitle: string,
  singer?: string,
  note?: string,
  categoryIds?: number[]
) {
  return request<RepertoireSong>(
    'post',
    '',
    { song_title: songTitle, singer, note, category_ids: categoryIds },
    'Error creating repertoire song'
  )
}

export async function updateRepertoire(
  id: number,
  updates: {
    song_title?: string
    singer?: string
    note?: string
    status?: number
    sort_order?: number
    category_ids?: number[]
  }
) {
  return request('put', `/${id}`, updates, 'Error updating repertoire song')
}

// 下架（軟刪除）
export async function deleteRepertoire(id: number) {
  return request('delete', `/${id}`, undefined, 'Error archiving repertoire song')
}

// 恢復上架
export async function restoreRepertoire(id: number) {
  return updateRepertoire(id, { status: 1 })
}

export async function importRepertoire(
  songs: { song_title: string; singer?: string; category_slugs?: string[] }[]
) {
  return request<RepertoireSong[]>('post', '/import', { songs }, 'Error importing repertoire')
}
