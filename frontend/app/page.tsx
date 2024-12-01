"use client";

import { useState } from "react";

import { LoopInfoJson } from "@/types";
import { PagedLoopList } from "@/components/paged-loop-list";

export default function Home() {
  const mockLoopInfo1: LoopInfoJson = {
    id: 123,
    title: "A loop",
    author: { id: 1, username: "Some one" },
    bpm: 114,
    loop: [
      { sample: "house_kick.wav", sequence: Array<boolean>(16).fill(false) },
      { sample: "house_snare.wav", sequence: Array<boolean>(16).fill(false) },
      {
        sample: "closed_hh.wav",
        sequence: Array<boolean[]>(8).fill([true, false]).flat(),
      },
      { sample: "open_hh.wav", sequence: Array<boolean>(16).fill(false) },
    ],
    createdAt: new Date(),
    rating: 9.43,
    ratingCount: 40,
  };
  const mockLoopInfo2: LoopInfoJson = {
    id: 345,
    title: "Another loop",
    author: { id: 2, username: "Some one else" },
    bpm: 96,
    loop: [
      { sample: "house_kick.wav", sequence: Array<boolean>(16).fill(false) },
      {
        sample: "house_snare.wav",
        sequence: Array<boolean[]>(4).fill([true, false, false, false]).flat(),
      },
      {
        sample: "closed_hh.wav",
        sequence: Array<boolean[]>(8).fill([true, false]).flat(),
      },
      { sample: "open_hh.wav", sequence: Array<boolean>(16).fill(false) },
    ],
    createdAt: new Date(),
    rating: 6.66,
    ratingCount: 66,
  };
  const mockLoopInfo3: LoopInfoJson = {
    id: 456,
    title: "Another loop3",
    author: { id: 3, username: "Some one else3" },
    bpm: 120,
    loop: [
      { sample: "house_kick.wav", sequence: Array<boolean>(16).fill(false) },
      {
        sample: "house_snare.wav",
        sequence: Array<boolean[]>(4).fill([true, false, false, false]).flat(),
      },
      {
        sample: "closed_hh.wav",
        sequence: Array<boolean[]>(8).fill([true, false]).flat(),
      },
      { sample: "open_hh.wav", sequence: Array<boolean>(16).fill(false) },
    ],
    createdAt: new Date(),
    rating: 6.66,
    ratingCount: 66,
  };
  const mockLoopInfo4: LoopInfoJson = {
    id: 678,
    title: "Another loop4",
    author: { id: 4, username: "Some one else4" },
    bpm: 140,
    loop: [
      { sample: "house_kick.wav", sequence: Array<boolean>(16).fill(false) },
      {
        sample: "house_snare.wav",
        sequence: Array<boolean[]>(4).fill([true, false, false, false]).flat(),
      },
      {
        sample: "closed_hh.wav",
        sequence: Array<boolean[]>(8).fill([true, false]).flat(),
      },
      { sample: "open_hh.wav", sequence: Array<boolean>(16).fill(false) },
    ],
    createdAt: new Date(),
    rating: 6.66,
    ratingCount: 66,
  };
  const mockLoopInfo5: LoopInfoJson = {
    id: 789,
    title: "super super super super super super super super long title",
    author: { id: 5, username: "super super super super super long name" },
    bpm: 55,
    loop: [
      {
        sample: "house_kick.wav",
        sequence: Array<boolean[]>(4).fill([true, false, false, false]).flat(),
      },
      {
        sample: "house_snare.wav",
        sequence: Array<boolean[]>(4).fill([false, false, true, false]).flat(),
      },
      {
        sample: "closed_hh.wav",
        sequence: Array<boolean[]>(8).fill([false, true]).flat(),
      },
      { sample: "open_hh.wav", sequence: Array<boolean>(16).fill(false) },
    ],
    createdAt: new Date(),
    rating: 6.66,
    ratingCount: 66,
  };
  const mockLoops = [
    mockLoopInfo1,
    mockLoopInfo2,
    mockLoopInfo3,
    mockLoopInfo4,
    mockLoopInfo5,
  ];
  // const { data, error, isLoading } = useSWR("/api/user/123", );
  const [page, setPage] = useState(1);

  console.log(mockLoopInfo5.loop);

  return (
    <>
      <PagedLoopList
        loops={mockLoops}
        page={page}
        setPage={setPage}
        totalPages={10}
      />
    </>
  );
}
