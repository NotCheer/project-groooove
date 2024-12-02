"use client";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Input,
} from "@nextui-org/react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { LoopEditor } from "@/components/loop-editor";
import { LoopJson } from "@/types";
import { createLoop } from "@/util/api";

type Inputs = {
  title: string;
};

export default function Create() {
  const initialLoop: LoopJson = [
    { sample: "house_kick.wav", sequence: Array<boolean>(16).fill(false) },
    { sample: "house_snare.wav", sequence: Array<boolean>(16).fill(false) },
    { sample: "closed_hh.wav", sequence: Array<boolean>(16).fill(false) },
    { sample: "open_hh.wav", sequence: Array<boolean>(16).fill(false) },
  ];

  const [loop, setLoop] = useState(initialLoop);
  const [bpm, setBpm] = useState(128);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const router = useRouter();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      const loopInfo = await createLoop({
        loop,
        bpm,
        ...data,
      });

      router.push(`/loop/${loopInfo.id}`);
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <p className="font-bold text-2xl pl-1">Create a new loop</p>
        </CardHeader>
        <Divider />
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardBody className="gap-4">
            <Input
              {...register("title", {
                required: "Please give your loop a title",
              })}
              isRequired
              color={errors.title !== undefined ? "danger" : "default"}
              errorMessage={errors.title?.message}
              isInvalid={errors.title !== undefined}
              label="Title"
              placeholder="Give your loop a cool name!"
              size="lg"
              type="text"
            />
            <LoopEditor
              bpm={bpm}
              loop={loop}
              setBpm={setBpm}
              setLoop={setLoop}
            />
            <Button type="submit">SAVE</Button>
          </CardBody>
        </form>
      </Card>
    </>
  );
}
