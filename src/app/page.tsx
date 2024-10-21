import MessageBoard from "@/components/admin/messageBoard";
import SongBook from "@/components/admin/songBook";
import SongList from "@/components/admin/songList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <div className="flex h-screen p-12">
      <Tabs defaultValue="songList" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="songList">歌單</TabsTrigger>
          <TabsTrigger value="songBook">歌本</TabsTrigger>
          <TabsTrigger value="messageBoard">留言板</TabsTrigger>
        </TabsList>
        <TabsContent value="songList">
          <SongList />
        </TabsContent>
        <TabsContent value="songBook">
          <SongBook />
        </TabsContent>
        <TabsContent value="messageBoard">
          <MessageBoard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
