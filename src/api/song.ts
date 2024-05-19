import axios from "axios";

function generateApiUrl(endpoint: string) {
  return `https://shustream.zeabur.app/songList${endpoint}`;
}

// 取得歌曲列表
export async function getSongs() {
  const endpoint = "";

  const requestData = {};

  try {
    const response = await axios.get(generateApiUrl(endpoint), {
      params: requestData,
    });

    return response;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error("Error saving data: " + error.message);
    } else {
      throw new Error("Unknown error occurred");
    }
  }
}

// 現正播放的歌曲
export async function playSong(id: number) {
  const endpoint = `/start/${id}`;

  const requestData = {};

  try {
    const response = await axios.put(generateApiUrl(endpoint), {
      params: requestData,
    });

    return response;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error("Error saving data: " + error.message);
    } else {
      throw new Error("Unknown error occurred");
    }
  }
}

// 清除現正播放的歌曲
export async function clearNowPlaying(id: number) {
  const endpoint = `/stop/${id}`;

  const requestData = {};

  try {
    const response = await axios.put(generateApiUrl(endpoint), {
      params: requestData,
    });

    return response;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error("Error saving data: " + error.message);
    } else {
      throw new Error("Unknown error occurred");
    }
  }
}

// 新增歌曲
export async function addSong(title: string, artist: string) {
  const endpoint = "";

  const requestData = {
    title,
    artist,
  };

  try {
    const response = await axios.post(generateApiUrl(endpoint), requestData);

    return response;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error("Error saving data: " + error.message);
    } else {
      throw new Error("Unknown error occurred");
    }
  }
}

// 刪除歌曲
export async function deleteSong(id: number) {
  const endpoint = `/${id}`;

  try {
    const response = await axios.delete(generateApiUrl(endpoint));

    return response;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error("Error saving data: " + error.message);
    } else {
      throw new Error("Unknown error occurred");
    }
  }
}

// 刪除所有歌曲
export async function deleteAllSongs() {
  const endpoint = "";

  const requestData = {};

  try {
    const response = await axios.delete(generateApiUrl(endpoint), {
      params: requestData,
    });

    return response;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error("Error saving data: " + error.message);
    } else {
      throw new Error("Unknown error occurred");
    }
  }
}

// 更新歌曲
export async function updateSong(id: number, title: string, artist: string) {
  const endpoint = `/${id}`;

  const requestData = {
    title,
    artist,
  };

  try {
    const response = await axios.put(generateApiUrl(endpoint), requestData);

    return response;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error("Error saving data: " + error.message);
    } else {
      throw new Error("Unknown error occurred");
    }
  }
}
