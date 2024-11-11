import { LoopJson, Sequencer } from "@/components/sequencer";

export default function Home() {
  const initialLoop: LoopJson = [
    { sample: "house_kick.wav", sequence: Array<boolean>(16).fill(false) },
    { sample: "house_snare.wav", sequence: Array<boolean>(16).fill(false) },
    { sample: "closed_hh.wav", sequence: Array<boolean>(16).fill(false) },
    { sample: "open_hh.wav", sequence: Array<boolean>(16).fill(false) },
  ];

  return (
    <>
      <h1>grooove</h1>
      <Sequencer initialLoop={initialLoop} />
    </>
  );
}
