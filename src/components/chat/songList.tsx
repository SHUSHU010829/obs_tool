"use client";

import { lazy, Suspense, useEffect, useState } from "react";

interface Song {
  id: number;
  title: string;
  artist: string;
  now_playing: number;
}

const Album = lazy(() => import("../album"));

export default function SongList({ songs }: { songs: Song[] }) {
  const perSongCount = 5;
  const [currentSet, setCurrentSet] = useState(0);
  const [fade, setFade] = useState(true);
  const [nowPlayingSong, setNowPlayingSong] = useState<Song | null>(null);

  const sets = Math.ceil(songs.length / perSongCount);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentSet(prevSet => (prevSet + 1) % sets);
        setFade(true);
      }, 500); // 等待 500 毫秒後切換歌曲組並恢復透明度
    }, 6000); // 6秒切換一次
    return () => clearInterval(interval);
  }, [sets]);

  const startIndex = currentSet * perSongCount;
  const currentSongs = songs.slice(startIndex, startIndex + perSongCount);

  useEffect(() => {
    const playingSong = songs.find(song => song.now_playing === 1);
    setNowPlayingSong(playingSong || null);
  }, [songs]);

  return (
    <div className="flex h-[780px] w-[450px] flex-col items-center rounded-3xl border-4 border-[#9ca18e] bg-[#f9f7f3] bg-opacity-70 shadow-lg">
      <Suspense fallback={<div></div>}>
        <Album />
      </Suspense>
      {/* NOW PLAYING */}
      <div className="mt-[-45px] flex flex-col items-center justify-center px-10 ">
        <p className="font-notoSans text-2xl font-bold">
          {nowPlayingSong ? nowPlayingSong.title : ""}
        </p>
        <p className="font-notoSans text-xl font-bold text-slate-500">
          {nowPlayingSong ? nowPlayingSong.artist : ""}
        </p>
      </div>
      <div className="w-full px-28 pt-4">
        <hr className="gradient"></hr>
      </div>
      {/* SONG LIST */}
      <div
        className={`flex w-full flex-col gap-4 px-10 pt-5 transition-opacity duration-500 ${fade ? "opacity-100" : "opacity-0"}`}
      >
        {currentSongs.map((song, index) => (
          <div className="flex items-center gap-2 font-notoSans" key={index}>
            <p
              className={`time-font rounded-lg px-2 font-mono font-semibold text-white ${song.now_playing === 1 ? "bg-red-700" : "bg-slate-700"}`}
            >
              {String(index + startIndex + 1).padStart(2, "0")}
            </p>
            <div>
              <p className=" font-notoSans font-bold">{song.title}</p>
              <p className=" font-notoSans text-sm font-bold text-slate-500">
                {song.artist}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
