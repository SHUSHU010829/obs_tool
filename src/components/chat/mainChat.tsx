"use client";

import { getStreams } from "@/api/twitch";
import { useEffect, useState } from "react";
import { GoPersonFill } from "react-icons/go";
import { BsTwitterX, BsYoutube } from "react-icons/bs";
import { AiFillSmile } from "react-icons/ai";

export default function MainChat() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewersCount, setViewersCount] = useState<string>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeClass, setFadeClass] = useState("");
  const socialMediaAccounts = [
    { icon: <BsTwitterX />, name: "shushu010829", ifShow: true },
    { icon: <BsYoutube />, name: "shushu0829", ifShow: true },
    { icon: <AiFillSmile />, name: "謝謝關注", ifShow: false },
  ];

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date());
    };
    const intervalId = setInterval(updateTime, 1000);

    const fetchStreamData = async () => {
      const data = await getStreams();
      if (data.data[0]) {
        setViewersCount(data.data[0].viewer_count);
      }
    };
    fetchStreamData();
    const streamIntervalId = setInterval(fetchStreamData, 20000); // 每20秒刷新一次数据

    return () => {
      clearInterval(intervalId);
      clearInterval(streamIntervalId);
    };
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setFadeClass("fadeOut");
      setTimeout(() => {
        setCurrentIndex(
          prevIndex => (prevIndex + 1) % socialMediaAccounts.length
        );
        setFadeClass("");
      }, 1000);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [socialMediaAccounts.length]);

  const currentAccount = socialMediaAccounts[currentIndex];

  const formatTime = (time: number) => (time < 10 ? `0${time}` : time);
  const hour = currentTime.getHours();
  const daysOfWeek = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];

  return (
    <div className="flex h-[780px] w-[380px] flex-col items-center justify-start rounded-3xl border-4 border-[#6b705c] bg-[#f9f7f3] bg-opacity-70 pt-12 shadow-lg">
      {/* 月份&週 */}
      <div className="flex items-center gap-3">
        <p className="text-xl font-bold text-slate-700">
          {currentTime.getMonth()}月{currentTime.getDate()}日
        </p>
        <p className="text-xl font-bold text-slate-700">
          {daysOfWeek[currentTime.getDay()]}
        </p>
      </div>
      {/* 時間 */}
      <div className="time-font pt-2">
        <p className="text-6xl font-bold text-[#2f3e46]">
          <span>{formatTime(hour)}</span>
          <span className="animate-fade-in-out">:</span>
          <span>{formatTime(currentTime.getMinutes())}</span>
        </p>
      </div>
      <div className="flex justify-between gap-2">
        {/* 觀眾計數顯示 */}
        <div className="flex h-16 w-24 items-center justify-center text-xl font-bold text-[#6b705c]">
          {viewersCount ? (
            <div className="flex items-center gap-2">
              <GoPersonFill />
              {viewersCount}
            </div>
          ) : (
            <div>讀取中</div>
          )}
        </div>
        {/* 社群媒體帳號 */}
        <div className="flex h-16 w-48 items-center justify-center text-xl font-semibold text-[#6b705c]">
          <div className={`account flex items-center gap-3 ${fadeClass}`}>
            <div>{currentAccount.icon}</div>
            <div className="flex items-center gap-1 text-lg">
              {currentAccount.ifShow && (
                <span className="text-base text-[#E87D35]">@</span>
              )}
              {currentAccount.name}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
