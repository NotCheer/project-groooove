"use client";

import { useRef, useEffect, useState } from "react";
import {
  Application,
  Assets,
  Container,
  Renderer,
  Sprite,
  Texture,
} from "pixi.js";
import { Button } from "@nextui-org/button";
import * as Tone from "tone";

type TrackJson = { sample: string; sequence: boolean[] };
export type LoopJson = TrackJson[];

interface Props {
  initialLoop: LoopJson;
}

interface DrumSet {
  [key: string]: Tone.Player;
}

const drumSet: DrumSet = {};

let triggers: Tone.Loop[] = [];

setInterval(() => {
  console.log("#triggers: " + triggers.length);
}, 3000);

export const Sequencer = ({ initialLoop }: Props) => {
  // const WIDTH = 600;
  // const HEIGHT = 400;
  const pixiContainer = useRef<HTMLDivElement>(null!);
  const appRef = useRef<Application<Renderer>>(null!);
  const [playing, setPlaying] = useState(false);
  const [loop, setLoop] = useState(initialLoop);

  const [pixiInitialized, setPixiInitialized] = useState(false);
  const [textureLoaded, setTextureLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      if (!appRef.current) {
        appRef.current = new Application();
        await appRef.current.init({
          background: "#FFFFFF",
          // resizeTo: pixiContainer.current,
        });

        // Attach the canvas to the container
        if (pixiContainer.current) {
          pixiContainer.current.appendChild(appRef.current.canvas);
        }
      }
    })();
    setPixiInitialized(true);
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

    for (const trigger of triggers) {
      trigger.stop();
    }
    const newTriggers: Tone.Loop[] = [];

    drumloop.tracks.forEach((track) => {
      track.steps.forEach((step) => {
        if (step.on) {
          console.log("added a trigger");
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
        ).toDestination();
      }
    }
  }, [loop]);

  useEffect(() => {
    console.log(Tone.getTransport().state);
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

  function togglePlaying() {
    setPlaying(!playing);
  }

  return (
    <>
      <Button onClick={togglePlaying}>{playing ? "STOP" : "PLAY"}</Button>
      <div ref={pixiContainer} />
    </>
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
