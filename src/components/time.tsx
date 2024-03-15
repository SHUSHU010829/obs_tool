"use client";

import { useEffect, useState } from "react";

const Time = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  const updateTime = () => {
    const timeInTaiwan = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Taipei" })
    );
    setCurrentTime(timeInTaiwan);
  };

  useEffect(() => {
    const intervalId = setInterval(updateTime, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="time-font text-3xl font-bold">
      {currentTime.getHours() < 10
        ? "0" + currentTime.getHours()
        : currentTime.getHours()}
      :
      {currentTime.getMinutes() < 10
        ? "0" + currentTime.getMinutes()
        : currentTime.getMinutes()}
      :
      {currentTime.getSeconds() < 10
        ? "0" + currentTime.getSeconds()
        : currentTime.getSeconds()}
    </div>
  );
};

export default Time;
