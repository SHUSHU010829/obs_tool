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
      }, 500);
    }, 6000);
    return () => clearInterval(interval);
  }, [sets]);

  const startIndex = currentSet * perSongCount;
  const currentSongs = songs.slice(startIndex, startIndex + perSongCount);

  useEffect(() => {
    const playingSong = songs.find(song => song.now_playing === 1);
    setNowPlayingSong(playingSong || null);
  }, [songs]);

  return (
    <div
      className="chat-container flex w-[320px] flex-col overflow-hidden"
      style={{ background: 'transparent' }}
    >
      {/* Header */}
      <div
        className="flex items-center border-b flex-shrink-0"
        style={{
          padding: '13px 16px',
          gap: 9,
          background: 'rgba(0,255,135,0.03)',
          borderColor: 'rgba(0,255,135,0.16)',
        }}
      >
        <span
          className="font-spaceMono font-bold uppercase"
          style={{ fontSize: '10.5px', letterSpacing: '0.13em', color: '#00FF87' }}
        >
          Now Playing
        </span>
      </div>

      {/* Now Playing */}
      <div className="flex flex-col items-center px-4 pt-3 pb-2">
        <Suspense fallback={<div></div>}>
          <Album />
        </Suspense>
        <div className="mt-2 flex flex-col items-center w-full text-center">
          <p
            className="font-spaceMono text-base font-bold leading-tight truncate w-full"
            style={{ color: '#FFFFFF' }}
          >
            {nowPlayingSong ? nowPlayingSong.title : "-- --"}
          </p>
          <p
            className="font-spaceMono text-xs mt-1 truncate w-full"
            style={{ color: '#00FF87' }}
          >
            {nowPlayingSong ? nowPlayingSong.artist : "-- --"}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="px-4 py-2">
        <div style={{ height: '1px', background: 'rgba(0,255,135,0.16)' }} />
      </div>

      {/* Queue Header */}
      <div className="px-4 pb-2">
        <span
          className="font-spaceMono font-bold uppercase"
          style={{ fontSize: '9px', letterSpacing: '0.13em', color: 'rgba(180,230,200,0.5)' }}
        >
          Queue
        </span>
      </div>

      {/* Song List */}
      <div
        className={`flex w-full flex-col gap-2 px-4 pb-4 transition-opacity duration-500 ${fade ? "opacity-100" : "opacity-0"}`}
      >
        {currentSongs.map((song, index) => (
          <div className="flex items-center gap-3" key={index}>
            <span
              className="font-spaceMono text-xs font-bold flex-shrink-0 flex items-center justify-center rounded"
              style={{
                width: '24px',
                height: '24px',
                background: song.now_playing === 1
                  ? 'rgba(0,255,135,0.16)'
                  : 'rgba(255,255,255,0.06)',
                color: song.now_playing === 1 ? '#00FF87' : 'rgba(255,255,255,0.7)',
                border: song.now_playing === 1
                  ? '1px solid rgba(0,255,135,0.28)'
                  : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {String(index + startIndex + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <p
                className="font-notoSans text-sm font-semibold truncate"
                style={{ color: '#d4f5e2' }}
              >
                {song.title}
              </p>
              <p
                className="font-notoSans text-xs truncate"
                style={{ color: 'rgba(180,230,200,0.5)' }}
              >
                {song.artist}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
