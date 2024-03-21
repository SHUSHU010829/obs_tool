"use client";

import {
  ChatBubbleIcon,
  DotFilledIcon,
  PlayIcon,
  QuoteIcon,
  ResumeIcon,
  VideoIcon,
} from "@radix-ui/react-icons";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import MessageBoard from "@/components/chat/messageBoard";
import MainChat from "@/components/chat/mainChat";
import SongList from "@/components/chat/songList";

export default function Chat() {
  return (
    <div className="flex h-screen items-center">
      <div className="flex gap-5">
        <MainChat />
        {/* <div className="flex flex-col gap-5">
          <SongList />
          <MessageBoard text="去拿外送噗" />
        </div> */}
      </div>
    </div>
  );
}
