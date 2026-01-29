import axios from 'axios'

function generateApiUrl(endpoint: string) {
  return `https://shustream.zeabur.app/songList${endpoint}`
}

// ============================================
// 查詢類 API
// ============================================

// 取得所有歌曲（含歸檔）
export async function getSongs() {
  const endpoint = ''

  try {
    const response = await axios.get(generateApiUrl(endpoint))
    return response
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error('Error fetching songs: ' + error.message)
    } else {
      throw new Error('Unknown error occurred')
    }
  }
}

// 取得活動中歌曲（已排序）- 前端顯示當前歌單用
export async function getActiveSongs() {
  const endpoint = '/active'

  try {
    const response = await axios.get(generateApiUrl(endpoint))
    return response
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error('Error fetching active songs: ' + error.message)
    } else {
      throw new Error('Unknown error occurred')
    }
  }
}

// 取得歷史歌曲（已歸檔）
export async function getHistorySongs() {
  const endpoint = '/history'

  try {
    const response = await axios.get(generateApiUrl(endpoint))
    return response
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error('Error fetching history songs: ' + error.message)
    } else {
      throw new Error('Unknown error occurred')
    }
  }
}

// ============================================
// 播放控制 API
// ============================================

// 設定播放中的歌曲
export async function playSong(id: number) {
  const endpoint = `/start/${id}`

  try {
    const response = await axios.put(generateApiUrl(endpoint))
    return response
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error('Error starting song: ' + error.message)
    } else {
      throw new Error('Unknown error occurred')
    }
  }
}

// 停止播放
export async function clearNowPlaying(id: number) {
  const endpoint = `/stop/${id}`

  try {
    const response = await axios.put(generateApiUrl(endpoint))
    return response
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error('Error stopping song: ' + error.message)
    } else {
      throw new Error('Unknown error occurred')
    }
  }
}

// ============================================
// 新增/更新 API
// ============================================

// 新增歌曲
export async function addSong(title: string, artist: string) {
  const endpoint = ''

  const requestData = {
    title,
    artist,
  }

  try {
    const response = await axios.post(generateApiUrl(endpoint), requestData)
    return response
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error('Error adding song: ' + error.message)
    } else {
      throw new Error('Unknown error occurred')
    }
  }
}

// 更新歌曲資訊
export async function updateSong(id: number, title: string, artist: string) {
  const endpoint = `/${id}`

  const requestData = {
    title,
    artist,
  }

  try {
    const response = await axios.put(generateApiUrl(endpoint), requestData)
    return response
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error('Error updating song: ' + error.message)
    } else {
      throw new Error('Unknown error occurred')
    }
  }
}

// ============================================
// 排序 API
// ============================================

// 更新單一歌曲排序
export async function updateSongSortOrder(id: number, sortOrder: number) {
  const endpoint = `/sort/${id}`

  const requestData = {
    sort_order: sortOrder,
  }

  try {
    const response = await axios.put(generateApiUrl(endpoint), requestData)
    return response
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error('Error updating sort order: ' + error.message)
    } else {
      throw new Error('Unknown error occurred')
    }
  }
}

// 批量更新排序（拖曳排序用）
export async function batchUpdateSortOrder(songs: { id: number; sort_order: number }[]) {
  const endpoint = '/sort'

  const requestData = {
    songs,
  }

  try {
    const response = await axios.put(generateApiUrl(endpoint), requestData)
    return response
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error('Error batch updating sort order: ' + error.message)
    } else {
      throw new Error('Unknown error occurred')
    }
  }
}

// ============================================
// 刪除/歸檔 API
// ============================================

// 歸檔歌曲（軟刪除）
export async function deleteSong(id: number) {
  const endpoint = `/${id}`

  try {
    const response = await axios.delete(generateApiUrl(endpoint))
    return response
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error('Error archiving song: ' + error.message)
    } else {
      throw new Error('Unknown error occurred')
    }
  }
}

// 歸檔所有歌曲（軟刪除）
export async function deleteAllSongs() {
  const endpoint = ''

  try {
    const response = await axios.delete(generateApiUrl(endpoint))
    return response
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error('Error archiving all songs: ' + error.message)
    } else {
      throw new Error('Unknown error occurred')
    }
  }
}

// 恢復歸檔歌曲
export async function restoreSong(id: number) {
  const endpoint = `/restore/${id}`

  try {
    const response = await axios.put(generateApiUrl(endpoint))
    return response
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error('Error restoring song: ' + error.message)
    } else {
      throw new Error('Unknown error occurred')
    }
  }
}

// 永久刪除歌曲
export async function hardDeleteSong(id: number) {
  const endpoint = `/hard/${id}`

  try {
    const response = await axios.delete(generateApiUrl(endpoint))
    return response
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error('Error permanently deleting song: ' + error.message)
    } else {
      throw new Error('Unknown error occurred')
    }
  }
}

// 永久刪除所有歌曲
export async function hardDeleteAllSongs() {
  const endpoint = '/hard'

  try {
    const response = await axios.delete(generateApiUrl(endpoint))
    return response
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error('Error permanently deleting all songs: ' + error.message)
    } else {
      throw new Error('Unknown error occurred')
    }
  }
}
