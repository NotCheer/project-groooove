"use client";

import { useState } from "react";

import { LoopPlayer } from "@/components/loop-player";

export default function Home() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const mockLoopInfo = {
    id: "123",
    title: "A loop",
    author: "Some one",
    bpm: 114,
    loop: [
      { sample: "house_kick.wav", sequence: Array<boolean>(16).fill(false) },
      { sample: "house_snare.wav", sequence: Array<boolean>(16).fill(false) },
      { sample: "closed_hh.wav", sequence: Array<boolean>(16).fill(false) },
      { sample: "open_hh.wav", sequence: Array<boolean>(16).fill(false) },
    ],
  };

  const stopPlaying = () => {
    setPlayingId(null);
  };

  return (
    <>
      <LoopPlayer
        loopInfo={mockLoopInfo}
        playing={playingId === mockLoopInfo.id}
        setPlaying={() => {
          setPlayingId(mockLoopInfo.id);
        }}
        stopPlaying={stopPlaying}
      />
    </>
  );
}
