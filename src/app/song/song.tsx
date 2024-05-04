"use client";

import { useEffect, useState } from "react";

import { getSongs } from "@/api/song";
import MainChat from "@/components/chat/mainChat";
import SongList from "@/components/chat/songList";

export default function Song() {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getSongs();
      setSongs(res.data);
    };

    // 每两秒执行一次 fetchData
    const interval = setInterval(fetchData, 2000);

    // 组件卸载时清除定时器
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen items-center">
      <div className="flex gap-5">
        <SongList songs={songs} />
      </div>
    </div>
  );
}
