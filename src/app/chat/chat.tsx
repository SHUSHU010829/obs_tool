import MainChat from "@/components/chat/mainChat";
import SongList from "@/components/chat/songList";

export default function Chat() {
  return (
    <div className="flex h-screen items-center">
      <div className="flex gap-5">
        <MainChat />
        {/* <SongList /> */}
      </div>
    </div>
  );
}
