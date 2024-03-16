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
      console.log(`[DATA] ${user}: ${command} ${message} [${flags.broadcaster}]`)
      if (command === "退訂") {
        onPlay("unSubscribe.mp4");
      } else if (command === "媽咪") {
        onPlay("sekiMommy1.mp4");
      } else if (command === "哭" || message === "kspkspCrycat" || message === "shushu23Cry" ) {
        onPlay("kspCry.mp4");
      } else if (command === "姐姐" || command === "姊姊") {
        onPlay("kspMiss.mp4");
      } else if (command === "婆") {
        onPlay("kspWife2.mp4");
      } else if (command === "早安") {
        onPlay("kspMorning.mp4");
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
