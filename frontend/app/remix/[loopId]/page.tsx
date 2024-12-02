"use client";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Input,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";

import { LoopEditor } from "@/components/loop-editor";
import { LoopJson } from "@/types";
import { useUserId } from "@/hooks/useUserId";

type Prop = {
  params: {
    loopId: string;
  };
};

export default function RemixLoopId({ params: { loopId } }: Prop) {
  const userId = useUserId();
  const router = useRouter();

  if (userId == null) {
    router.push("/login");
  }
  console.log("editing loop with ID = " + loopId);
  const initialLoop: LoopJson = [
    { sample: "house_kick.wav", sequence: Array<boolean>(16).fill(false) },
    { sample: "house_snare.wav", sequence: Array<boolean>(16).fill(false) },
    { sample: "closed_hh.wav", sequence: Array<boolean>(16).fill(false) },
    { sample: "open_hh.wav", sequence: Array<boolean>(16).fill(false) },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <p className="font-bold text-2xl pl-1">Create a new loop</p>
        </CardHeader>
        <Divider />
        <CardBody className="gap-4">
          <Input isRequired label="Title" size="sm" type="text" />
          <Input isRequired label="Author" size="sm" type="text" />
          <LoopEditor initialBpm={128} initialLoop={initialLoop} />
          <Button>SAVE</Button>
        </CardBody>
      </Card>
    </>
  );
}
