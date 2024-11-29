"use client";

import {
  Button,
  Card,
  CardBody,
  Link,
  Tooltip,
  useDisclosure,
} from "@nextui-org/react";

import { RateModal } from "./rate-modal";

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

  const rateModalState = useDisclosure();

  return (
    <>
      <Card>
        <CardBody className="gap-4 flex justify-center">
          <div className="flex flex-row justify-between items-center gap-4">
            <Button onPress={togglePlaying}>{playing ? "STOP" : "PLAY"}</Button>
            <p className="text-lg">
              <b>{loopInfo.title}</b> by <b>{loopInfo.author}</b>
            </p>
            <p> {loopInfo.bpm} BPM</p>
            <div className="basis-0 flex-grow" />
            <Tooltip closeDelay={50} content="Rate this loop">
              <Button onPress={rateModalState.onOpen}>Rate</Button>
            </Tooltip>
            <RateModal
              isOpen={rateModalState.isOpen}
              onOpenChange={rateModalState.onOpenChange}
            />
            <Tooltip closeDelay={50} content="Create a remix!">
              <Button as={Link} href={`/remix/${loopInfo.id}`}>
                Remix
              </Button>
            </Tooltip>
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
