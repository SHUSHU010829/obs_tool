// twitch.ts
"use client";

import { useEffect } from "react";
var ComfyJS = require("comfy.js");

const TwitchChatListener = ({
  channelName,
  onUnsubscribe,
}: {
  channelName: string;
  onUnsubscribe?: (videoName: string) => void;
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
        if (onUnsubscribe) {
          onUnsubscribe("unSubscribe.mp4");
        }
      } else if (flags.broadcaster && command === "媽咪") {
        if (onUnsubscribe) {
          onUnsubscribe("sekiMommy.mp4");
        }
      }
    };
    ComfyJS.Init(channelName);

    return () => {
      ComfyJS.Disconnect();
    };
  }, [channelName, onUnsubscribe]);

  return null;
};

export default TwitchChatListener;
