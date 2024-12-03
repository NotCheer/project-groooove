"use client";

import { CircularProgress } from "@nextui-org/react";
import useSWR from "swr";
import { useState } from "react";

import { getLoopById } from "@/util/api";
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
  } = useSWR([id, "getLoopById"], ([id, _]) => getLoopById(id));

  const [playing, setPlaying] = useState(false);

  if (error) {
    return <p>error: {error}</p>;
  }

  if (!loop || isLoading) {
    return <CircularProgress className="mx-auto p-6" size="lg" />;
  }

  return (
    <>
      <LoopPlayer
        loopInfo={loop}
        playing={playing}
        startPlaying={() => setPlaying(true)}
        stopPlaying={() => setPlaying(false)}
      />
    </>
  );
}
