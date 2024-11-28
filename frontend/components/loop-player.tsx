"use client";

import { Button, Card, CardBody, Link } from "@nextui-org/react";

import { Sequencer } from "@/components/sequencer";
import { LoopInfoJson } from "@/types";

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
          <div className="flex flex-row justify-between items-center gap-4">
            <Button onClick={togglePlaying}>{playing ? "STOP" : "PLAY"}</Button>
            <p className="text-lg ">
              <b>{loopInfo.title}</b> by <b>{loopInfo.author}</b>
            </p>
            <p> {loopInfo.bpm} BPM</p>
            <div className="basis-0 flex-grow" />
            <Button as={Link} href={`/remix/${loopInfo.id}`}>
              REMIX
            </Button>
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
