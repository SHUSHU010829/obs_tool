'use client';

import { useEffect, useState } from 'react';

export default function SongCard() {

  return (
    <div>
      <div className="slow-spin inline-block p-24 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        <div className="p-1 bg-slate-200 bg-opacity-80 rounded-full">
          <div className="p-4 bg-white rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
