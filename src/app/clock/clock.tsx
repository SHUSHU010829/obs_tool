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

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
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
      <div className="py- flex items-center rounded-xl border-4 border-[#354f52] bg-[#f9f7f3] px-10 py-6 shadow-lg opacity-80">
        <div className=" clock__circle">
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
        </div>

        <div className="ml-8">
          <div>
            <p className="text-lg font-bold text-slate-700">
              {daysOfWeek[currentTime.getDay()]},{" "}
              {monthsOfYear[currentTime.getMonth()]}{" "}
              {formatTime(currentTime.getDate())}
            </p>
          </div>
          <div className="time-font pt-2">
            <p className="text-5xl font-bold text-[#2f3e46]">
              {formatTime(hour % 12 || 12)}
              <span className="animate-fade-in-out pl-1">:</span>
              {formatTime(currentTime.getMinutes())}
              <span className="pl-2 text-base">{amPm}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
