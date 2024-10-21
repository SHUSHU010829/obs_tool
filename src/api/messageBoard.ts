import axios from "axios";

function generateApiUrl(endpoint: string) {
  return `https://shustream.zeabur.app/messageBoard${endpoint}`;
}

// 新增歌曲
export async function getMsgBoard() {
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
