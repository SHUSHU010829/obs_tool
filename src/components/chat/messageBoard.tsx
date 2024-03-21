"use client";

import { Pencil2Icon } from "@radix-ui/react-icons";

export default function MessageBoard({ text }: { text: string }) {
  return (
    <div className="flex h-[160px] w-[480px] flex-col justify-start rounded-3xl border-4 border-[#93806c] bg-[#f9f7f3] bg-opacity-70 p-8 shadow-lg">
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-end gap-3 text-lg font-bold text-[#5c6064]">
          <Pencil2Icon className="h-5 w-5" />
          留言板
        </div>
        <div className="text-3xl font-semibold  text-[#2f3e46]">{text}</div>
      </div>
    </div>
  );
}
