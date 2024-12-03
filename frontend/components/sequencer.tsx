import { useRef, useEffect, useState, useContext } from "react";
import {
  Application,
  Assets,
  Container,
  Graphics,
  Renderer,
  Sprite,
  Texture,
} from "pixi.js";
import { initDevtools } from "@pixi/devtools";
import * as Tone from "tone";

import { ToneContext } from "@/context/tone-context";
import { LoopJson, TrackJson } from "@/types";

interface Props {
  loop: LoopJson;
  setLoop: (loop: LoopJson) => void;
  playing: boolean;
  bpm: number;
}

interface DrumSet {
  [key: string]: Tone.Player;
}

const sampleToName: { [key: string]: string } = {
  "house_kick.wav": "Kick",
  "house_snare.wav": "Snare",
  "closed_hh.wav": "Closed Hi-hat",
  "open_hh.wav": "Open Hi-hat",
};

/**
 * The sequencer in a pixi.js canvas
 */
export const Sequencer = ({ loop, setLoop, playing, bpm }: Props) => {
  const pixiContainer = useRef<HTMLDivElement>(null!);
  const appRef = useRef<Application<Renderer>>(null!);
  const playheadContainerRef = useRef<Container>(null!);
  const drumloopContainerRef = useRef<Container>(null!);
  const drumSet = useRef({} as DrumSet);
  const triggers = useRef([] as Tone.Loop[]);

  const playheadLoopRef = useRef<Tone.Loop>(null!);

  const [pixiInitialized, setPixiInitialized] = useState(false);
  const [textureLoaded, setTextureLoaded] = useState(false);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const toneOutput = useContext(ToneContext);

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

  function fixAspectRatio() {
    if (pixiContainer.current) {
      const width = pixiContainer.current.offsetWidth;

      pixiContainer.current.style.height = `${(width / (16 * 160)) * (4 * 240)}px`;
    }
  }
  //Fix aspect ratio of the canvas container
  useEffect(fixAspectRatio);

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
      .fill({ color: "f7a278", alpha: 0.6 });

    playheadContainerRef.current.removeChildren();
    playheadContainerRef.current.addChild(playhead);
  }, [pixiInitialized, playing, playheadPosition]);

  const stopAllTriggers = () => {
    for (const trigger of triggers.current) {
      trigger.stop();
      trigger.dispose();
    }
  };

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

    drumloop.tracks.forEach((track) => {
      track.steps.forEach((step) => {
        step.sprite.on("pointertap", () => {
          const newLoop = structuredClone(loop);

          newLoop[track.trackNo].sequence[step.stepNo] = !step.on;
          setLoop(newLoop);
        });
      });
    });
  }, [pixiInitialized, textureLoaded, loop]);

  useEffect(() => {
    if (playing) {
      const newTriggers: Tone.Loop[] = [];

      loop.forEach((track) => {
        track.sequence.forEach((step, stepNo) => {
          if (step) {
            const trigger = new Tone.Loop((time) => {
              drumSet.current[track.sample].start(time);
            }, "1m").start(Tone.Time("16n").toSeconds() * stepNo);

            newTriggers.push(trigger);
          }
        });
      });
      stopAllTriggers();
      triggers.current = newTriggers;
    }
  }, [loop, playing]);

  useEffect(() => {
    for (const track of loop) {
      if (!(track.sample in drumSet.current)) {
        drumSet.current[track.sample] = new Tone.Player(
          `/audio/${track.sample}`,
        ).connect(toneOutput);
      }
    }
  }, [loop]);

  useEffect(() => {
    if (playing) {
      Tone.getTransport().bpm.value = bpm;
    }
  }, [bpm, playing]);

  useEffect(() => {
    if (playing) {
      Tone.loaded().then(() => {
        Tone.getTransport().stop();
        setPlayheadPosition(0);
        Tone.getTransport().start();
      });
    } else if (!playing && Tone.getTransport().state == "started") {
      stopAllTriggers();
    }
  }, [playing]);

  // Clean up after unmounting
  useEffect(() => {
    return () => {
      for (const track of loop) {
        drumSet.current[track.sample].stop();
      }
      stopAllTriggers();
    };
  }, []);

  return (
    <div className="flex flex-row flex-grow-0">
      <div className="flex flex-col justify-around mr-2 flex-grow-0 min-w-32">
        {loop.map((track) => (
          <div
            key={track.sample}
            className="text-center basis-0 flex-grow flex flex-col justify-center flex-nowrap"
          >
            {sampleToName[track.sample]}
          </div>
        ))}
      </div>
      <div ref={pixiContainer} className="flex-grow flex-shrink" />
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
