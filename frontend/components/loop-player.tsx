"use client";

import { Button, Card, CardBody } from "@nextui-org/react";

import { LoopJson, Sequencer } from "@/components/sequencer";

export interface LoopInfoJson {
  id: string;
  title: string;
  author: string;
  loop: LoopJson;
  bpm: number;
}

interface Props {
  loopInfo: LoopInfoJson;
  playing: boolean;
  setPlaying: Function;
  stopPlaying: Function;
}

export const LoopPlayer = ({
  loopInfo,
  playing,
  setPlaying,
  stopPlaying,
}: Props) => {
  function togglePlaying() {
    if (!playing) {
      setPlaying();
    } else {
      stopPlaying();
    }
  }

  return (
    <>
      <Card>
        <CardBody className="gap-4 flex justify-center">
          <div className="flex flex-row justify-start gap-4">
            <Button onClick={togglePlaying}>{playing ? "STOP" : "PLAY"}</Button>
            <p className="text-lg font-bold">
              {loopInfo.title} by {loopInfo.author}
            </p>
          </div>
          <Sequencer
            bpm={loopInfo.bpm}
            loop={loopInfo.loop}
            playing={playing}
            setLoop={() => {}}
          />
        </CardBody>
      </Card>
    </>
  );
};
