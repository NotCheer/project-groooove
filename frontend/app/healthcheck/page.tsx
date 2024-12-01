"use client"

import {healthCheck} from "@/util/api";
import {useState, useEffect} from "react";

export default function Login() {

  const [health, setHealth] = useState<string>("");

  useEffect(() => {
    healthCheck().then(response => {
      setHealth(response.message)
      console.log("health:" +  health);
    });
  }, []);

  return (
    <>
      <p>{health}</p>
    </>
  );
}
