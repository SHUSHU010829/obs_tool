"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrashIcon } from "@radix-ui/react-icons";
import {
  addSong,
  clearNowPlaying,
  deleteAllSongs,
  deleteSong,
  getSongs,
  playSong,
} from "@/api/song";
import { Label } from "../ui/label";

interface Song {
  id: number;
  title: string;
  artist: string;
  now_playing: number;
}

export default function Admin() {
  const [songList, setSongList] = useState<Song[]>();
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getSongs();
      setSongList(res.data);
    };
    fetchData();
  }, []);

  const handleAddSong = async () => {
    await addSong(title.trim(), artist.trim());
    const res = await getSongs();
    setSongList(res.data);
    setOpen(false);
  };

  const handleDelete = async (id: number) => {
    await deleteSong(id);
    const res = await getSongs();
    setSongList(res.data);
  };

  const handleDeleteAll = async () => {
    await deleteAllSongs();
    const res = await getSongs();
    setSongList(res.data);
  };

  const handlePlay = async (id: number, now_playing: number) => {
    if (now_playing === 1) {
      await clearNowPlaying(id);
    } else {
      await playSong(id);
    }
    const res = await getSongs();
    setSongList(res.data);
  };

  return (
    <div className="flex h-screen p-12">
      <Tabs defaultValue="songList" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="songList">歌單</TabsTrigger>
        </TabsList>
        <TabsContent value="songList">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center justify-between">
                  <div>歌單</div>
                  <div className="flex gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">清除全部</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            確定要刪除歌單嗎？
                          </AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteAll}>
                            確定
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {songList && (
                <>
                  {songList.map((song: any, index: number) => (
                    <div className="flex items-center gap-3" key={index}>
                      <Button
                        onClick={() => handlePlay(song.id, song.now_playing)}
                        className={`${song.now_playing === 1 && "bg-orange-400"}`}
                      >
                        <div className="w-5 font-bold">
                          {String(index + 1).padStart(2, "0")}
                        </div>
                      </Button>
                      <Input
                        id={`artist-${index}`}
                        defaultValue={song.artist}
                        placeholder="歌手"
                        className="w-[35%]"
                      />
                      <Input
                        id={`title-${index}`}
                        defaultValue={song.title}
                        placeholder="歌名"
                      />
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(song.id)}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
                </>
              )}
              <Dialog onOpenChange={setOpen} open={open}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    新增歌曲
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>新增歌曲</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="flex items-center gap-3">
                      <Label htmlFor="name" className="text-nowrap text-right">
                        歌手
                      </Label>
                      <Input
                        id="artist"
                        onChange={e => {
                          setArtist(e.target.value);
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Label
                        htmlFor="username"
                        className="text-nowrap  text-right"
                      >
                        歌名
                      </Label>
                      <Input
                        id="title"
                        onChange={e => {
                          setTitle(e.target.value);
                        }}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={handleAddSong}>
                      確認
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
