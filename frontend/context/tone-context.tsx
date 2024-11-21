"use client";

import React, {
  createContext,
  useRef,
  ReactNode,
  MutableRefObject,
} from "react";
import * as Tone from "tone";

type ToneRef = {
  output: Tone.InputNode;
};

type ToneContextType = MutableRefObject<ToneRef>;

export const ToneContext = createContext<ToneContextType>(null!);

export const ToneContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const toneRef = useRef<ToneRef>({
    output: new Tone.Volume(-10).toDestination(),
  });

  return (
    <ToneContext.Provider value={toneRef}>{children}</ToneContext.Provider>
  );
};
