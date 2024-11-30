"use client";

import React, {
  createContext,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import * as Tone from "tone";

export const ToneContext = createContext<Tone.InputNode>(null!);

export const ToneContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const outputRef = useRef<Tone.InputNode>(null!);
  const [isOutputCreated, setIsOutputCreated] = useState(false);

  useEffect(() => {
    if (!isOutputCreated)
      outputRef.current = new Tone.Volume(-10).toDestination();
    setIsOutputCreated(true);
  }, []);

  return (
    <ToneContext.Provider value={outputRef.current}>
      {isOutputCreated && children}
    </ToneContext.Provider>
  );
};
