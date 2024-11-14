import { useRef, useEffect, useState, SetStateAction, Dispatch } from "react";
import {
  Application,
  Assets,
  Container,
  Renderer,
  Sprite,
  Texture,
} from "pixi.js";
import * as Tone from "tone";
import { initDevtools } from "@pixi/devtools";

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

let triggers: Tone.Loop[] = [];

const masterVolume = new Tone.Volume(-10).toDestination();

/**
 * The sequencer in a pixi.js canvas
 */
export const Sequencer = ({ loop, setLoop, playing }: Props) => {
  // const WIDTH = 600;
  // const HEIGHT = 400;
  const pixiContainer = useRef<HTMLDivElement>(null!);
  const appRef = useRef<Application<Renderer>>(null!);

  const [pixiInitialized, setPixiInitialized] = useState(false);
  const [textureLoaded, setTextureLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      if (!appRef.current) {
        appRef.current = new Application();
        await appRef.current.init({
          background: "#FFFFFF",
          resizeTo: pixiContainer.current,
        });
        initDevtools({ app: appRef.current });

        // Attach the canvas to the container
        if (pixiContainer.current) {
          pixiContainer.current.appendChild(appRef.current.canvas);
        }
        setPixiInitialized(true);
      }
    })();
  }, []);

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

  useEffect(() => {
    if (!pixiInitialized || !textureLoaded) {
      return;
    }
    const drumloop = new Drumloop(loop);

    appRef.current.stage.removeChildren();
    appRef.current.stage.addChild(drumloop.container);

    drumloop.container.x = appRef.current.screen.width / 2;
    drumloop.container.y = appRef.current.screen.height / 2;

    for (const trigger of triggers) {
      trigger.stop();
    }
    const newTriggers: Tone.Loop[] = [];

    drumloop.tracks.forEach((track) => {
      track.steps.forEach((step) => {
        if (step.on) {
          const trigger = new Tone.Loop((time) => {
            drumSet[track.sample].start(time);
          }, "1m").start(Tone.Time("16n").toSeconds() * step.stepNo);

          newTriggers.push(trigger);
        }
        step.sprite.on("click", () => {
          const newLoop = structuredClone(loop);

          newLoop[track.trackNo].sequence[step.stepNo] = !step.on;
          setLoop(newLoop);
        });
      });
    });

    triggers = newTriggers;
  }, [pixiInitialized, textureLoaded, loop]);

  useEffect(() => {
    for (const track of loop) {
      if (!(track.sample in drumSet)) {
        drumSet[track.sample] = new Tone.Player(
          `/audio/${track.sample}`,
        ).connect(masterVolume);
      }
    }
  }, [loop]);

  useEffect(() => {
    if (playing && Tone.getTransport().state !== "started") {
      Tone.loaded().then(() => {
        Tone.getTransport().bpm.value = 128;
        Tone.getTransport().start();
      });
    } else if (!playing && Tone.getTransport().state == "started") {
      Tone.getTransport().cancel(Tone.now());
      Tone.getTransport().stop();
    }
  }, [playing]);

  return <div ref={pixiContainer} className="w-[800px] h-[300px]" />;
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
    const size = this.container.getSize();

    this.container.pivot.set(size.width / 2, size.height / 2);
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
