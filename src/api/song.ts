import axios from "axios";

function generateApiUrl(endpoint: string) {
  return `https://shustream.zeabur.app/songList${endpoint}`;
}

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

export async function addSong(title: string, artist: string) {
  const endpoint = "";

  const requestData = {
    title,
    artist,
  };

  try {
    const response = await axios.post(generateApiUrl(endpoint), requestData);
    console.log("🚀 ~ addSong ~ response:", response);

    return response;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error("Error saving data: " + error.message);
    } else {
      throw new Error("Unknown error occurred");
    }
  }
}

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
