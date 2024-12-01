import { useState } from "react";

import { LoopPlayer } from "./loop-player";

import { LoopInfoJson } from "@/types";

type Props = {
  loops: LoopInfoJson[];
};

export const LoopList = ({ loops }: Props) => {
  const [playingId, setPlayingId] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-4">
      {loops.map((loop) => (
        <LoopPlayer
          key={loop.id}
          loopInfo={loop}
          playing={playingId === loop.id}
          startPlaying={() => {
            setPlayingId(loop.id);
          }}
          stopPlaying={() => setPlayingId(null)}
        />
      ))}
    </div>
  );
};
