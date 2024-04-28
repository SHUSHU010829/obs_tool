"use client";

import Album from "../album";
import { useEffect, useState } from "react";

const song = [
  {
    title: "LAVA!",
    artist: "OZI",
    nowPlaying: false,
  },
  {
    title: "1",
    artist: "張碧晨",
    nowPlaying: false,
  },
  {
    title: "2",
    artist: "張碧晨",
    nowPlaying: true,
  },
  {
    title: "3",
    artist: "張碧晨",
    nowPlaying: false,
  },
  {
    title: "4",
    artist: "張碧晨",
    nowPlaying: false,
  },
  {
    title: "5",
    artist: "張碧晨",
    nowPlaying: false,
  },
  {
    title: "6",
    artist: "張碧晨",
    nowPlaying: false,
  },
  {
    title: "LAVA!",
    artist: "OZI",
    nowPlaying: false,
  },
  {
    title: "7",
    artist: "張碧晨",
    nowPlaying: false,
  },
  {
    title: "8",
    artist: "張碧晨",
    nowPlaying: false,
  },
  {
    title: "9",
    artist: "張碧晨",
    nowPlaying: false,
  },
  {
    title: "10",
    artist: "張碧晨",
    nowPlaying: false,
  },
  {
    title: "11",
    artist: "張碧晨",
    nowPlaying: false,
  },
  {
    title: "12",
    artist: "張碧晨",
    nowPlaying: false,
  },
  {
    title: "LAVA!",
    artist: "OZI",
    nowPlaying: false,
  },
  {
    title: "13",
    artist: "張碧晨",
    nowPlaying: false,
  },
  {
    title: "14",
    artist: "張碧晨",
    nowPlaying: false,
  },
];

export default function SongList() {
  const [currentSet, setCurrentSet] = useState(0);
  const [fade, setFade] = useState(true);
  const sets = Math.ceil(song.length / 8);

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

  const startIndex = currentSet * 8;
  const currentSongs = song.slice(startIndex, startIndex + 8);

  return (
    <div className="flex h-[780px] w-[450px] flex-col items-center rounded-3xl border-4 border-[#9ca18e] bg-[#f9f7f3] bg-opacity-70 shadow-lg">
      <Album />
      {/* NOW PLAYING */}
      <div className="mt-[-45px] flex flex-col">
        <p className="text-xl font-bold">雪人</p>
        <p className="font-semibold text-slate-500">SEKI</p>
      </div>
      <div className="w-full px-20 pt-3">
        <hr className="gradient"></hr>
      </div>
      {/* SONG LIST */}
      <div
        className={`flex w-full flex-col gap-3 pl-20 pt-4 transition-opacity duration-500 ${fade ? "opacity-100" : "opacity-0"}`}
      >
        {currentSongs.map((song, index) => (
          <div className="flex items-center gap-2" key={index}>
            <p
              className={`rounded-lg  px-2 font-mono font-semibold text-white ${song.nowPlaying ? "bg-red-700" : "bg-slate-700"}`}
            >
              {String(index + startIndex + 1).padStart(2, "0")}
            </p>
            <p className="text-lg font-bold">{song.title}</p>
            <div className="h-[6px] w-[6px] bg-red-700"></div>
            <p className="font-semibold text-slate-500">{song.artist}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
