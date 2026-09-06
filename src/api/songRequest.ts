import axios from 'axios'

const BASE_URL = '/api/stream/songRequest'

export type SongRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export interface SongRequest {
  id: number
  create_time: string
  decided_time: string | null
  repertoire_id: number | null
  song_title: string
  singer: string
  requester_twitch_id: string
  requester_login: string
  requester_display_name: string
  status: SongRequestStatus
  reject_reason: string | null
  song_list_id: number | null
  chat_notified: boolean
  chat_drop_reason: string | null
  source: string
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
      throw new Error(`${errorLabel ?? 'Error calling song request API'}: ${error.message}`)
    }
    throw new Error('Unknown error occurred')
  }
}

// 待審清單
export async function getPendingRequests() {
  return request<SongRequest[]>('get', '/pending', undefined, 'Error fetching pending requests')
}

// 全部點歌紀錄（可選狀態篩選）
export async function getAllRequests(status?: SongRequestStatus) {
  const endpoint = status ? `?status=${status}` : ''
  return request<SongRequest[]>('get', endpoint, undefined, 'Error fetching song requests')
}

// 接受點歌
export async function approveRequest(id: number) {
  return request('put', `/approve/${id}`, undefined, 'Error approving song request')
}

// 拒絕點歌（可選填原因）
export async function rejectRequest(id: number, reason?: string) {
  return request('put', `/reject/${id}`, { reason }, 'Error rejecting song request')
}

// 刪除點歌紀錄
export async function deleteRequest(id: number) {
  return request('delete', `/${id}`, undefined, 'Error deleting song request')
}
