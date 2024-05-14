import SongBook from "@/components/admin/songBook";
import SongList from "@/components/admin/songList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <div className="flex h-screen p-12">
      <Tabs defaultValue="songList" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="songList">歌單</TabsTrigger>
          <TabsTrigger value="songBook">歌本</TabsTrigger>
        </TabsList>
        <TabsContent value="songList">
          <SongList />
        </TabsContent>
        <TabsContent value="songBook">
          <SongBook />
        </TabsContent>
      </Tabs>
    </div>
  );
}
