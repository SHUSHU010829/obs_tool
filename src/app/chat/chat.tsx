'use client'

import { useEffect, useState } from "react";
import TwitchChatListener from "@/lib/twitch";

export default function Chat() {
  const [videoName, setVideoName] = useState("");

  const handleUnsubscribe = (name: string) => {
    setVideoName(name);
  };

  return (
    <div>
      <TwitchChatListener
        channelName="shushu010829"
        onUnsubscribe={handleUnsubscribe}
      />
    </div>
  );
}
