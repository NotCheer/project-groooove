"use client";

import { useState, useEffect } from "react";

import { healthCheck } from "@/util/api";

export default function HealthCheck() {
  const [health, setHealth] = useState<string>("");

  useEffect(() => {
    healthCheck().then((response) => {
      setHealth(response.message);
      console.log("health:" + health);
    });
  }, []);

  return (
    <>
      <p>{health}</p>
    </>
  );
}
