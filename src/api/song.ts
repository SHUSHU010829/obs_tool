import axios from 'axios'

const SONG_LIST_BASE_URL = 'https://shustream.zeabur.app/songList'
const PROXY_BASE_URL = '/api/stream/songList'

export const SONG_LIST_STREAM_URL = `${SONG_LIST_BASE_URL}/stream`

function generateApiUrl(endpoint: string) {
  return `${PROXY_BASE_URL}${endpoint}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function request<T = any>(
  method: 'get' | 'post' | 'put' | 'delete',
  endpoint: string,
  data?: unknown,
  errorLabel?: string
) {
  try {
    return await axios.request<T>({ method, url: generateApiUrl(endpoint), data })
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(`${errorLabel ?? 'Error calling song API'}: ${error.message}`)
    }
    throw new Error('Unknown error occurred')
  }
}

// ============================================
// 查詢類 API
// ============================================

// 取得所有歌曲（含歸檔）
export async function getSongs() {
  return request('get', '', undefined, 'Error fetching songs')
}

// 取得活動中歌曲（已排序）- 前端顯示當前歌單用
export async function getActiveSongs() {
  return request('get', '/active', undefined, 'Error fetching active songs')
}

// 取得歷史歌曲（已歸檔）
export async function getHistorySongs() {
  return request('get', '/history', undefined, 'Error fetching history songs')
}

// ============================================
// 播放控制 API
// ============================================

// 設定播放中的歌曲
export async function playSong(id: number) {
  return request('put', `/start/${id}`, undefined, 'Error starting song')
}

// 停止播放
export async function clearNowPlaying(id: number) {
  return request('put', `/stop/${id}`, undefined, 'Error stopping song')
}

// ============================================
// 新增/更新 API
// ============================================

// 新增歌曲
export async function addSong(title: string, artist: string) {
  return request('post', '', { title, artist }, 'Error adding song')
}

// 更新歌曲資訊
export async function updateSong(id: number, title: string, artist: string) {
  return request('put', `/${id}`, { title, artist }, 'Error updating song')
}

// ============================================
// 排序 API
// ============================================

// 更新單一歌曲排序
export async function updateSongSortOrder(id: number, sortOrder: number) {
  return request('put', `/sort/${id}`, { sort_order: sortOrder }, 'Error updating sort order')
}

// 批量更新排序（拖曳排序用）
export async function batchUpdateSortOrder(songs: { id: number; sort_order: number }[]) {
  return request('put', '/sort', { songs }, 'Error batch updating sort order')
}

// ============================================
// 刪除/歸檔 API
// ============================================

// 歸檔歌曲（軟刪除）
export async function deleteSong(id: number) {
  return request('delete', `/${id}`, undefined, 'Error archiving song')
}

// 歸檔所有歌曲（軟刪除）
export async function deleteAllSongs() {
  return request('delete', '', undefined, 'Error archiving all songs')
}

// 恢復歸檔歌曲
export async function restoreSong(id: number) {
  return request('put', `/restore/${id}`, undefined, 'Error restoring song')
}

// 永久刪除歌曲
export async function hardDeleteSong(id: number) {
  return request('delete', `/hard/${id}`, undefined, 'Error permanently deleting song')
}

// 永久刪除所有歌曲
export async function hardDeleteAllSongs() {
  return request('delete', '/hard', undefined, 'Error permanently deleting all songs')
}
