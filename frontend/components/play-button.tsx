import { Button } from "@nextui-org/react";
import { BsPlayFill, BsStopFill } from "react-icons/bs";

type Props = {
  playing: boolean;
  setPlaying: (playing: boolean) => void;
};

export const PlayButton = ({ playing, setPlaying }: Props) => {
  function togglePlaying() {
    setPlaying(!playing);
  }
  const ICON_STYLE = "min-w-5";

  return (
    <Button
      startContent={
        playing ? (
          <BsStopFill className={ICON_STYLE} size={20} />
        ) : (
          <BsPlayFill className={ICON_STYLE} size={20} />
        )
      }
      onClick={togglePlaying}
    >
      <p className="min-w-10">{playing ? "STOP" : "PLAY"}</p>
    </Button>
  );
};
