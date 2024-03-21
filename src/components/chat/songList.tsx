"use client";

import { DotFilledIcon, PlayIcon, ResumeIcon } from "@radix-ui/react-icons";

export default function SongList() {
  const songList = [
    {
      songName: "籠",
      nowPlaying: false,
    },
    {
      songName: "慢冷",
      nowPlaying: false,
    },
    {
      songName: "Beautiful Things",
      nowPlaying: true,
    },
    {
      songName: "字字句句",
      nowPlaying: false,
    },
    {
      songName: "再見",
      nowPlaying: false,
    },
    { songName: "Song 6", nowPlaying: false },
  ];

  const shouldMarquee = songList.length > 5;
  const tripledSongList = shouldMarquee
    ? [...songList, ...songList, ...songList]
    : songList;

  return (
    <div className="flex h-[300px] w-[480px] flex-col justify-start overflow-hidden rounded-3xl border-4 border-[#93806c] bg-[#f9f7f3] bg-opacity-70 p-8 shadow-lg">
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-end gap-3 text-lg font-bold text-[#5c6064]">
          <ResumeIcon className="h-5 w-5" />
          歌單
        </div>
        <div
          className={`flex flex-col gap-2 text-xl font-semibold text-[#2f3e46] ${shouldMarquee ? "marquee" : ""}`}
          style={
            shouldMarquee ? { animation: `marquee 15s linear infinite` } : {}
          }
        >
          {tripledSongList.map((song, index) => (
            <div key={index} className="flex items-center gap-2">
              {song.nowPlaying ? (
                <PlayIcon className="h-5 w-5" />
              ) : (
                <DotFilledIcon className="h-5 w-5" />
              )}
              <div>{song.songName}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
