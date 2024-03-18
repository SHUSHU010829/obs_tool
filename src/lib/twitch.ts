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
      } else if (command === "哭" || message === "kspkspcrycat" || message === "shushu23cry" ) {
        onPlay("kspCry.mp4");
      } else if (command === "姐姐" || command === "姊姊") {
        onPlay("kspMiss.mp4");
      } else if (command === "ks婆") {
        onPlay("kspWife2.mp4");
      } else if (command === "早安") {
        onPlay("kspMorning1.mp4");
      } else if (command === "5ma") {
        onPlay("seki5ma1.mp4");
      } else if (command === "0") {
        onPlay("seki01.mp4");
      } else if (command === "88") {
        onPlay("ksp88.mp4");
      } else if (command === "88") {
        onPlay("ksp88.mp4");
      } else if (command === "洗澡") {
        onPlay("kspBath.mp4");
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
