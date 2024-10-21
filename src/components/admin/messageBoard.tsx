"use client";

import { getMsgBoard } from "@/api/messageBoard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface MsgProp {
  id: number;
  create_time: string;
  message: string;
  reply_message: string | null;
}

export default function MessageBoard() {
  const [msg, setMsg] = useState<MsgProp[]>();

  useEffect(() => {
    const fetchData = async () => {
      const msgData = await getMsgBoard();
      setMsg(msgData.data);
    };
    fetchData();
  }, []);

  return (
    <>
      {msg &&
        msg.map(item => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>
                <div>
                  <div className="text-xs text-stone-500">
                    {new Date(item.create_time).toLocaleString("zh-TW", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="pb-1">{item.message}</div>
              <hr />
              <div className="pt-1">
                {item.reply_message ? (
                  <span>{item.reply_message}</span>
                ) : (
                  <span className="text-xs text-slate-500">尚未回覆</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
    </>
  );
}
