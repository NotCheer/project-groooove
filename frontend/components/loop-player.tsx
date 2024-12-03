import {
  Button,
  Card,
  CardBody,
  Link,
  Tooltip,
  useDisclosure,
} from "@nextui-org/react";
import NextLink from "next/link";

import { RateModal } from "@/components/rate-modal";
import { PlayButton } from "@/components/play-button";
import { Sequencer } from "@/components/sequencer";
import { LoopInfoJson } from "@/types";
import { useUserId } from "@/hooks/useUserId";

interface Props {
  loopInfo: LoopInfoJson;
  playing: boolean;
  startPlaying: () => void;
  stopPlaying: () => void;
}

export const LoopPlayer = ({
  loopInfo,
  playing,
  startPlaying,
  stopPlaying,
}: Props) => {
  const userId = useUserId();

  function setPlaying(playing: boolean) {
    if (playing) {
      startPlaying();
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
            <PlayButton playing={playing} setPlaying={setPlaying} />
            <div>
              <NextLink
                className="hover:opacity-80"
                href={`/loop/${loopInfo.id}`}
              >
                <p className="font-bold text-lg/none pt-1">{loopInfo.title}</p>
              </NextLink>
              <p className="text-sm leading-inherit">
                by{" "}
                <Link
                  className="font-semibold text-sm/none"
                  href={`/user/${loopInfo.author.id}`}
                >
                  {loopInfo.author.username}
                </Link>
              </p>
            </div>
            <p className="min-w-16"> {loopInfo.bpm} BPM</p>
            <div className="basis-0 flex-grow" />
            {userId != null ? (
              <>
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
              </>
            ) : (
              <div className="flex flex-col items-end mx-2">
                <Link href="/login">
                  <p className="font-bold">Login</p>
                </Link>
                <p className="text-sm leading-none">to rate/remix</p>
              </div>
            )}
          </div>
          <NextLink className="hover:opacity-95" href={`/loop/${loopInfo.id}`}>
            <Sequencer
              bpm={loopInfo.bpm}
              loop={loopInfo.loop}
              playing={playing}
              setLoop={() => {}}
            />
          </NextLink>
        </CardBody>
      </Card>
    </>
  );
};
