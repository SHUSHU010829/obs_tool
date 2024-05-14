"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SongBook() {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center justify-between">
              <div>歌本</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3"></CardContent>
      </Card>
    </div>
  );
}
