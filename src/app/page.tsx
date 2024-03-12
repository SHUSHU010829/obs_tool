'use client';

import { useEffect, useState } from "react";

export default function Home() {
  // useState to store the current time
  const [currentTime, setCurrentTime] = useState(new Date())

  // Function to update the time
  const updateTime = () => {
    // Taiwan is in GMT+8 timezone
    const timeInTaiwan = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Taipei' })
    )
    setCurrentTime(timeInTaiwan)
  }

  // useEffect to set up an interval for updating the time
  useEffect(() => {
    const intervalId = setInterval(updateTime, 1000)

    // Clean up the interval on component unmount
    return () => {
      clearInterval(intervalId)
    }
  }, [])
  
  return (
    <div className="flex items-center justify-center h-screen text-center">
      <div className="time-font text-2xl font-bold">
        {currentTime.getHours() < 10
          ? '0' + currentTime.getHours()
          : currentTime.getHours()}
        :
        {currentTime.getMinutes() < 10
          ? '0' + currentTime.getMinutes()
          : currentTime.getMinutes()}
        :
        {currentTime.getSeconds() < 10
          ? '0' + currentTime.getSeconds()
          : currentTime.getSeconds()}
      </div>
    </div>
  );
}
