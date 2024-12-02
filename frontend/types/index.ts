export type TrackJson = { sample: string; sequence: boolean[] };
export type LoopJson = TrackJson[];

export interface LoopInfoJson {
  id: number;
  title: string;
  author: BasicUser;
  loop: LoopJson;
  bpm: number;
  createdAt: Date;
  rating: number;
  ratingCount: number;
}

export interface BasicUser {
  username: string;
  id: number;
}

export interface DetailedUser extends BasicUser {
  avatar: string;
}
