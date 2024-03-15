"use client";

import { useEffect, useState } from "react";

export default function Clock() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date());
    };

    const intervalId = setInterval(updateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const getRotation = (time: number, max: number) => (time / max) * 360;
  const formatTime = (time: number) => (time < 10 ? `0${time}` : time);

  const hourRotation = getRotation(currentTime.getHours() % 12, 12);
  const minuteRotation = getRotation(currentTime.getMinutes(), 60);
  const secondRotation = getRotation(currentTime.getSeconds(), 60);

  const daysOfWeek = ["SUN", "MON", "TUES", "WED", "THUR", "FRI", "SAT"];
  const monthsOfYear = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const hour = currentTime.getHours();
  const amPm = hour >= 12 ? "PM" : "AM";

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="py- flex items-center rounded-3xl border-4 border-[#6b705c] bg-[#f9f7f3] bg-opacity-30 px-10 py-6 shadow-lg">
        <div className="clock__circle">
          <div className="clock__rounder"></div>
          <div
            className="clock__hour"
            style={{
              transform: `rotate(${hourRotation}deg)`,
              transformOrigin: "bottom",
            }}
          ></div>
          <div
            className="clock__minutes"
            style={{
              transform: `rotate(${minuteRotation}deg)`,
              transformOrigin: "bottom",
            }}
          ></div>
          <div
            className="clock__seconds"
            style={{
              transform: `rotate(${secondRotation}deg)`,
              transformOrigin: "bottom",
            }}
          ></div>
        </div>

        <div className="ml-8">
          <div className="flex items-center gap-3">
            <p className="rounded-xl bg-[#ddbea9] px-3 py-1 text-lg font-bold text-[#ffffff]">
              {daysOfWeek[currentTime.getDay()]}
            </p>
            <p className="text-lg font-bold text-slate-700">
              {monthsOfYear[currentTime.getMonth()]}{" "}
              {formatTime(currentTime.getDate())}
            </p>
          </div>
          <div className="time-font pt-2">
            <p className="text-5xl font-bold text-[#2f3e46]">
              {formatTime(hour % 12 || 12)}
              <span className="animate-fade-in-out"> : </span>
              {formatTime(currentTime.getMinutes())}
              <span className="pl-2 text-base">{amPm}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
