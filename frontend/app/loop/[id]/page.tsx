"use client";

import { CircularProgress } from "@nextui-org/react";
import useSWR from "swr";
import { useState } from "react";

import { getLoop } from "@/util/api";
import { LoopPlayer } from "@/components/loop-player";

type Prop = {
  params: {
    id: number;
  };
};

export default function LoopId({ params: { id } }: Prop) {
  const {
    data: loop,
    error,
    isLoading,
  } = useSWR([id, "getLoop"], ([id, _]) => getLoop(id));

  const [playing, setPlaying] = useState(false);

  if (isLoading) {
    return <CircularProgress size="lg" />;
  }
  if (error) {
    return <p>error: {error}</p>;
  }

  return (
    loop && (
      <>
        <LoopPlayer
          loopInfo={loop}
          playing={playing}
          startPlaying={() => setPlaying(true)}
          stopPlaying={() => setPlaying(false)}
        />
      </>
    )
  );
}
