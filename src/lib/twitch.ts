"use client";

import { useEffect } from "react";

interface VideoMap {
  [key: string]: string | string[];
}

const TwitchChatListener = ({
  channelName,
  onPlay,
}: {
  channelName: string;
  onPlay: (videoName: string) => void;
}) => {
  const pointVideoMap: VideoMap = {
    "888": ["ksp884.mp4", "ksp8881.mp4", "ksp88881.mp4"],
    退訂了: "unSubscribe2.mp4",
    TAT: "kspCry.mp4",
    "0": "seki01.mp4",
    好想姊姊: "kspMiss.mp4",
    婆: "kspWife2.mp4",
    早安: "kspMorning1.mp4",
    睡屁睡: "kspSleep1.mp4",
    LALALA: "shushuLa.mp4",
    媽咪: "sekiMommy.mp4",
    洗澡: "kspBath1.mp4",
    "5MA": "seki5ma1.mp4",
    蘑菇蘑菇: "kspMogu.mp4",
  };

  useEffect(() => {
    const token = process.env.TWITCH_OAUTH_TOKEN;
    const socket = new WebSocket("wss://pubsub-edge.twitch.tv");

    socket.onopen = function () {
      socket.send(
        JSON.stringify({
          type: "LISTEN",
          nonce: process.env.SOCKET_NONCE,
          data: {
            topics: [`channel-points-channel-v1.720691521`],
            auth_token: token,
          },
        })
      );
    };

    socket.onmessage = function (event) {
      const message = JSON.parse(event.data);
      if (message.type === "MESSAGE") {
        const messageData = JSON.parse(message.data.message);
        if (messageData.type === "reward-redeemed") {
          const rewardTitle = messageData.data.redemption.reward.title;
          let videoName = pointVideoMap[rewardTitle];
          if (Array.isArray(videoName)) {
            videoName = videoName[Math.floor(Math.random() * videoName.length)];
          }
          if (videoName) {
            onPlay(videoName);
          }
        }
      }
    };

    return () => socket.close();
  }, [channelName, onPlay]);

  return null;
};

export default TwitchChatListener;
