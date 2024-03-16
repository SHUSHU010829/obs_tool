// twitch.ts
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
  useEffect(() => {
    ComfyJS.onCommand = (
      user: any,
      command: string,
      message: any,
      flags: { broadcaster: any },
      extra: any
    ) => {
      if (flags.broadcaster && command === "退訂") {
        onPlay("unSubscribe.mp4");
      } else if (flags.broadcaster && command === "媽咪") {
        onPlay("sekiMommy.mp4");
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
