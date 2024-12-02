import { useState } from "react";
import { Card, CardBody, Input } from "@nextui-org/react";

import { PlayButton } from "./play-button";

import { Sequencer } from "@/components/sequencer";
import { LoopJson } from "@/types";

interface Props {
  loop: LoopJson;
  setLoop: (loop: LoopJson) => void;
  bpm: number;
  setBpm: (bpm: number) => void;
}

export const LoopEditor = ({ loop, setLoop, bpm, setBpm }: Props) => {
  const [inputBpm, setInputBpm] = useState(bpm);
  const [bpmIsvalid, setBpmIsValid] = useState(bpm > 0);
  const [playing, setPlaying] = useState(false);

  function handleBpmInput(newBpmStr: string) {
    const newBpm = parseInt(newBpmStr);

    setInputBpm(newBpm);
    if (isNaN(newBpm) || newBpm <= 0) {
      setBpmIsValid(false);

      return;
    }
    setBpmIsValid(true);
    setBpm(newBpm);
  }

  return (
    <Card>
      <CardBody className="gap-4 flex justify-center">
        <div className="flex flex-row justify-between gap-4">
          <PlayButton playing={playing} setPlaying={setPlaying} />
          <Input
            isInvalid={!bpmIsvalid}
            label="BPM"
            labelPlacement="outside-left"
            size="sm"
            type="number"
            value={`${inputBpm}`}
            onValueChange={handleBpmInput}
          />
        </div>
        <Sequencer bpm={bpm} loop={loop} playing={playing} setLoop={setLoop} />
      </CardBody>
    </Card>
  );
};
