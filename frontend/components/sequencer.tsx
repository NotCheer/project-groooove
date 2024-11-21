import {
  useRef,
  useEffect,
  useState,
  SetStateAction,
  Dispatch,
  useContext,
} from "react";
import {
  Application,
  Assets,
  Container,
  Graphics,
  Renderer,
  Sprite,
  Texture,
} from "pixi.js";
import * as Tone from "tone";
import { initDevtools } from "@pixi/devtools";

import { ToneContext } from "@/context/tone-context";

export type TrackJson = { sample: string; sequence: boolean[] };
export type LoopJson = TrackJson[];

interface Props {
  loop: LoopJson;
  setLoop: Dispatch<SetStateAction<LoopJson>>;
  playing: boolean;
  bpm: number;
}

interface DrumSet {
  [key: string]: Tone.Player;
}

const drumSet: DrumSet = {};

const sampleToName: { [key: string]: string } = {
  "house_kick.wav": "Kick",
  "house_snare.wav": "Snare",
  "closed_hh.wav": "Closed Hi-hat",
  "open_hh.wav": "Open Hi-hat",
};

let triggers: Tone.Loop[] = [];

/**
 * The sequencer in a pixi.js canvas
 */
export const Sequencer = ({ loop, setLoop, playing, bpm }: Props) => {
  // const WIDTH = 600;
  // const HEIGHT = 400;
  const pixiContainer = useRef<HTMLDivElement>(null!);
  const appRef = useRef<Application<Renderer>>(null!);
  const playheadContainerRef = useRef<Container>(null!);
  const drumloopContainerRef = useRef<Container>(null!);

  const playheadLoopRef = useRef<Tone.Loop>(null!);

  const [pixiInitialized, setPixiInitialized] = useState(false);
  const [textureLoaded, setTextureLoaded] = useState(false);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const toneRef = useContext(ToneContext);

  useEffect(() => {
    if (!playheadLoopRef.current) {
      playheadLoopRef.current = new Tone.Loop((_time) => {
        setPlayheadPosition((pos) => (pos + 1) % 16);
      }, "16n").start(Tone.Time("16n").toSeconds());
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (!appRef.current) {
        appRef.current = new Application();
        await appRef.current.init({
          backgroundAlpha: 0,
          resizeTo: pixiContainer.current,
        });
        initDevtools({ app: appRef.current });

        playheadContainerRef.current = new Container();
        drumloopContainerRef.current = new Container();
        appRef.current.stage.addChild(playheadContainerRef.current);
        appRef.current.stage.addChild(drumloopContainerRef.current);

        // Attach the canvas to the container
        if (pixiContainer.current) {
          pixiContainer.current.appendChild(appRef.current.canvas);
        }
        setPixiInitialized(true);
      }
    })();
  }, []);

  //Fix aspect ratio of the canvas container
  useEffect(() => {
    if (pixiContainer.current) {
      const width = pixiContainer.current.offsetWidth;

      pixiContainer.current.style.height = `${(width / (16 * 160)) * (4 * 240)}px`;
    }
  });

  useEffect(() => {
    (async () => {
      const [OFF_TEXTURE, ON_TEXTURE] = await Promise.all([
        Assets.load("/sprites/step-off.png"),
        Assets.load("/sprites/step-on.png"),
      ]);

      Step.OFF_TEXTURE = OFF_TEXTURE;
      Step.ON_TEXTURE = ON_TEXTURE;

      setTextureLoaded(true);
    })();
  }, []);

  //update playhead
  useEffect(() => {
    if (!pixiInitialized) {
      return;
    }
    if (!playing) {
      playheadContainerRef.current.removeChildren();

      return;
    }
    const app = appRef.current;
    const playhead = new Graphics()
      .rect(
        (app.screen.width / 16) * playheadPosition,
        0,
        app.screen.width / 16,
        app.screen.height,
      )
      .fill({ color: "FFFFFF", alpha: 0.2 });

    playheadContainerRef.current.removeChildren();
    playheadContainerRef.current.addChild(playhead);
  }, [pixiInitialized, playing, playheadPosition]);

  useEffect(() => {
    if (!pixiInitialized || !textureLoaded) {
      return;
    }
    const app = appRef.current;
    const drumloop = new Drumloop(loop);

    drumloopContainerRef.current.removeChildren();
    drumloopContainerRef.current.addChild(drumloop.container);
    drumloop.container.height = app.screen.height;
    drumloop.container.width = app.screen.width;

    const newTriggers: Tone.Loop[] = [];

    drumloop.tracks.forEach((track) => {
      track.steps.forEach((step) => {
        if (step.on) {
          const trigger = new Tone.Loop((time) => {
            drumSet[track.sample].start(time);
          }, "1m").start(Tone.Time("16n").toSeconds() * step.stepNo);

          newTriggers.push(trigger);
        }
        step.sprite.on("pointertap", () => {
          const newLoop = structuredClone(loop);

          newLoop[track.trackNo].sequence[step.stepNo] = !step.on;
          setLoop(newLoop);
        });
      });
    });
    for (const trigger of triggers) {
      trigger.stop();
    }
    triggers = newTriggers;
  }, [pixiInitialized, textureLoaded, loop]);

  useEffect(() => {
    for (const track of loop) {
      if (!(track.sample in drumSet)) {
        drumSet[track.sample] = new Tone.Player(
          `/audio/${track.sample}`,
        ).connect(toneRef.current.output);
      }
    }
  }, [loop]);

  useEffect(() => {
    Tone.getTransport().bpm.value = bpm;
  }, [bpm]);

  useEffect(() => {
    if (playing && Tone.getTransport().state !== "started") {
      Tone.loaded().then(() => {
        Tone.getTransport().start();
      });
    } else if (!playing && Tone.getTransport().state == "started") {
      Tone.getTransport().cancel(Tone.now());
      Tone.getTransport().stop();
      setPlayheadPosition(0);
    }
  }, [playing]);

  return (
    <div className="flex flex-row">
      <div className="flex flex-col justify-around mr-2">
        {loop.map((track) => (
          <div
            key={track.sample}
            className="text-center basis-0 flex-grow flex flex-col justify-center"
          >
            {sampleToName[track.sample]}
          </div>
        ))}
      </div>
      <div ref={pixiContainer} className="w-[600px]" />
    </div>
  );
};

class Drumloop {
  tracks: Track[];
  container = new Container();
  constructor(loop: LoopJson) {
    this.tracks = loop.map(
      (trackJson, trackNo) => new Track(this, trackNo, trackJson),
    );
    this.tracks.forEach((track) => {
      this.container.addChild(track.container);
    });
  }
}

class Track {
  drumloop: Drumloop;
  steps: Step[];
  container = new Container();
  sample: string;
  trackNo: number;

  constructor(drumloop: Drumloop, trackNo: number, trackJson: TrackJson) {
    this.drumloop = drumloop;
    this.trackNo = trackNo;
    this.sample = trackJson.sample;
    this.steps = trackJson.sequence.map(
      (on, stepNo) => new Step(this, stepNo, on),
    );
    this.steps.forEach((step) => {
      this.container.addChild(step.sprite);
    });
    this.container.y = this.trackNo * this.container.getSize().height;
  }
}

class Step {
  static ON_TEXTURE: Texture;
  static OFF_TEXTURE: Texture;
  sprite: Sprite;
  track: Track;
  stepNo: number;
  on: boolean;
  constructor(track: Track, stepNo: number, on: boolean) {
    this.track = track;
    this.stepNo = stepNo;
    this.on = on;
    this.sprite = Sprite.from(on ? Step.ON_TEXTURE : Step.OFF_TEXTURE);
    this.sprite.eventMode = "static";
    this.sprite.scale = 0.25;
    this.sprite.x = this.stepNo * this.sprite.getSize().width;
  }
}
