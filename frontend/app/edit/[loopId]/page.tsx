"use client";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CircularProgress,
  Divider,
  Input,
} from "@nextui-org/react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { LoopEditor } from "@/components/loop-editor";
import { getLoopById, updateLoopById } from "@/util/api";
import { LoopInfoJson, LoopJson } from "@/types";
import { useUserId } from "@/hooks/useUserId";
import { LoginRequired } from "@/components/login-required";

type Inputs = {
  title: string;
};

type Props = {
  params: {
    loopId: number;
  };
};

export default function EditLoopId({ params: { loopId } }: Props) {
  const initialLoopInfo = useRef<LoopInfoJson | null>(null);
  const [loop, setLoop] = useState<LoopJson>(null!);
  const [bpm, setBpm] = useState<number>(null!);
  const [error, setError] = useState<string | null>(null);

  const userId = useUserId();

  useEffect(() => {
    (async () => {
      try {
        initialLoopInfo.current = await getLoopById(loopId);

        setLoop(initialLoopInfo.current.loop);
        setBpm(initialLoopInfo.current.bpm);
        setError(null);
      } catch (err) {
        setError(err as string);
      }
    })();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const router = useRouter();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      const loopInfo = await updateLoopById(initialLoopInfo.current!.id, {
        loop,
        bpm,
        ...data,
      });

      router.push(`/loop/${loopInfo.id}`);
    } catch (err: any) {
      setError(err);
    }
  };

  if (userId == null) {
    return <LoginRequired message="Login is required to edit this loop" />;
  }

  if (error) {
    return <p>error: {error}</p>;
  }

  if (!initialLoopInfo.current) {
    return <CircularProgress className="mx-auto p-6" size="lg" />;
  }

  if (userId != initialLoopInfo.current.author.id) {
    return <p>Only the author of the loop can edit it</p>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <p className="font-bold text-2xl pl-1">
            Editing{" "}
            <Link href={`/loop/${initialLoopInfo.current.id}`}>
              <span className="text-primary hover:opacity-80">
                &quot;{initialLoopInfo.current.title}&quot;
              </span>
            </Link>
          </p>
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
              defaultValue={initialLoopInfo.current.title}
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
