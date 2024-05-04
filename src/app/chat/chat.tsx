"use client";

import { useEffect, useState } from "react";

import { getSongs } from "@/api/song";
import MainChat from "@/components/chat/mainChat";
import SongList from "@/components/chat/songList";

export default function Chat() {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getSongs();
      setSongs(res.data);
    };
    fetchData();
  }, []);

  return (
    <div className="flex h-screen items-center">
      <div className="flex gap-5">
        <MainChat />
        {songs.length > 0 && <SongList songs={songs} />}
      </div>
    </div>
  );
}
