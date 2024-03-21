"use client";

import { useEffect } from "react";
var ComfyJS = require("comfy.js");

const TwitchChatListener = ({
  channelName,
  onPlay,
}: {
  channelName: string;
  onPlay: (videoName: string) => void;
}) => {

  // 這裡是指令
  const commandToVideoMap = {
    "退訂": "unSubscribe.mp4",
    "哭": "kspCry.mp4",
    "姐姐": "kspMiss.mp4",
    "姊姊": "kspMiss.mp4",
    "ks婆": "kspWife2.mp4",
    "早安": "kspMorning1.mp4",
    "5ma": "seki5ma1.mp4",
    "0": "seki01.mp4",
    "88": "ksp884.mp4",
    "洗澡": "kspBath1.mp4",
    "草": "shushuLa.mp4",
    "晚安": 'kspSleep1.mp4',
    "kseki": 'sekiLove.mp4',
  };

  // 這裡是普通聊天
  const chatToVideoMap = {
    "kspkspCrycat": "kspCry.mp4",
    "哭": "kspCry.mp4",
    "shush23Cry": "kspCry.mp4",
    "sekimePien sekimeZero": "seki01.mp4",
    "kspkspLove sekimeShy": "sekiLove.mp4",
  };

  useEffect(() => {
    ComfyJS.onCommand = (
      user: string,
      command: string,
      message: string,
      flags: { broadcaster: string },
      extra: any
    ) => {
      if (commandToVideoMap[command as keyof typeof commandToVideoMap]) {
        onPlay(commandToVideoMap[command as keyof typeof commandToVideoMap]);
      }
    };

    ComfyJS.onChat = (
      user: string,
      command: string,
      message: string,
      flags: { broadcaster: string },
      extra: any
    ) => {
      if (chatToVideoMap[command as keyof typeof chatToVideoMap]) {
        onPlay(chatToVideoMap[command as keyof typeof chatToVideoMap]);
      }
    };

    ComfyJS.Init(channelName);

    return () => {
      ComfyJS.Disconnect();
    };
  }, [channelName, onPlay]);

  return null;
};

export default TwitchChatListener;
