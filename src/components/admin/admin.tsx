import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { TrashIcon } from "@radix-ui/react-icons";
import { Switch } from "../ui/switch";

export default function Admin() {
  const songList = [
    {
      songName: "籠",
      nowPlaying: false,
    },
    {
      songName: "慢冷",
      nowPlaying: false,
    },
    {
      songName: "Beautiful Things",
      nowPlaying: true,
    },
    {
      songName: "字字句句",
      nowPlaying: false,
    },
    {
      songName: "再見",
      nowPlaying: false,
    },
    { songName: "Song 6", nowPlaying: false },
  ];

  return (
    <div className="flex h-screen p-12">
      <Tabs defaultValue="message" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="songList">歌單</TabsTrigger>
          <TabsTrigger value="message">留言板</TabsTrigger>
        </TabsList>
        <TabsContent value="songList">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center justify-between">
                  <div>歌單</div>
                  <Switch id="songList-mode" />
                </div>
              </CardTitle>
              <CardDescription>新增歌曲＆目前播放。</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {songList.map((song: any, index: number) => (
                <div className="flex items-center gap-3" key={index}>
                  <div className="font-bold">{index + 1}</div>
                  <Input id={`song-${index}`} defaultValue={song.songName} />
                  <Button variant="destructive">
                    <TrashIcon className="h-5 w-5" />
                  </Button>
                </div>
              ))}
              <Button variant="secondary" className="w-full">
                新增歌曲
              </Button>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="destructive">清除全部</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="message">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center justify-between">
                  <div>留言板</div>
                  <Switch id="message-mode" />
                </div>
              </CardTitle>
              <CardDescription>設置留言板訊息。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <RadioGroup defaultValue="delivery">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="delivery" id="r1" />
                  <Label htmlFor="r1">去拿外送噗噗</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="work" id="r2" />
                  <Label htmlFor="r2">工作中</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="r3" />
                  <Label htmlFor="r3">其他</Label>
                </div>
              </RadioGroup>
              <Textarea placeholder="Type your message here." />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="destructive">清除</Button>
              <Button>設置</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
