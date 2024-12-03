"use client";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CircularProgress,
  Divider,
} from "@nextui-org/react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import useSWR from "swr";

import { LoopEditor } from "@/components/loop-editor";
import { createLoop, getLoopById, getUserById } from "@/util/api";
import { LoopInfoJson, LoopJson } from "@/types";
import { useUserId } from "@/hooks/useUserId";
import { LoginRequired } from "@/components/login-required";

type Inputs = {};

type Props = {
  params: {
    loopId: number;
  };
};

export default function RemixLoopId({ params: { loopId } }: Props) {
  const initialLoopInfo = useRef<LoopInfoJson | null>(null);
  const [loop, setLoop] = useState<LoopJson>(null!);
  const [bpm, setBpm] = useState<number>(null!);
  const [error, setError] = useState<string | null>(null);

  const userId = useUserId();

  const { data: user } = useSWR(
    () => (userId == null ? null : [userId, "getUserById"]),
    ([id, _]) => getUserById(id),
  );

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

  const { handleSubmit } = useForm<Inputs>();

  const router = useRouter();

  if (userId == null) {
    return <LoginRequired message="Login is required to remix this loop" />;
  }

  if (error) {
    return <p>error: {error}</p>;
  }

  if (!initialLoopInfo.current || !user) {
    return <CircularProgress className="mx-auto p-6" size="lg" />;
  }

  const onSubmit: SubmitHandler<Inputs> = async (_) => {
    try {
      const loopInfo = await createLoop({
        loop,
        bpm,
        title: `${initialLoopInfo.current?.title} (${user.username} Remix)`,
      });

      router.push(`/loop/${loopInfo.id}`);
    } catch (err: any) {
      setError(err);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <p className="font-bold text-2xl pl-1">
            Remixing{" "}
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
