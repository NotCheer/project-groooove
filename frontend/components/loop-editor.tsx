"use client";

import { useState } from "react";
import { Button, Card, CardBody, CardHeader, Input } from "@nextui-org/react";

import { LoopJson, Sequencer } from "@/components/sequencer";

interface Props {
  initialLoop: LoopJson;
}

export const LoopEditor = ({ initialLoop }: Props) => {
  const [loop, setLoop] = useState(initialLoop);
  const [playing, setPlaying] = useState(false);

  function togglePlaying() {
    setPlaying(!playing);
  }

  return (
    <>
      <Card>
        <CardHeader>Loop Editor</CardHeader>
        <CardBody className="gap-4">
          <Input isRequired label="Title" size="sm" type="text" />
          <Input isRequired label="Author" size="sm" type="text" />
          <Button>SAVE</Button>
        </CardBody>
      </Card>
      <div className="flex justify-center">
        <div>
          <Button onClick={togglePlaying}>{playing ? "STOP" : "PLAY"}</Button>
          <Sequencer
            bpm={128}
            loop={loop}
            playing={playing}
            setLoop={setLoop}
          />
        </div>
      </div>
    </>
  );
};
