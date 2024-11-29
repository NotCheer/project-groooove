export type TrackJson = { sample: string; sequence: boolean[] };
export type LoopJson = TrackJson[];

export interface LoopInfoJson {
  id: string;
  title: string;
  author: string;
  loop: LoopJson;
  bpm: number;
}
