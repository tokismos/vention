import { useEffect, useState } from "react";
import { step, DEFAULT_CONFIG, initialState, type PendulumState, type PendulumConfig } from "@/core";

const DT = 1 / 60;

export type Status = "running" | "paused" | "stopped";

export function useSimulation() {
  const [config, setConfig] = useState<PendulumConfig>(DEFAULT_CONFIG);
  const [state, setState] = useState<PendulumState>(initialState(DEFAULT_CONFIG));
  const [status, setStatus] = useState<Status>("stopped");

  useEffect(() => {
    if (status !== "running") return;
    const id = setInterval(() => {
      setState((s) => step(s, config.length, DT));
    }, DT * 1000);
    return () => clearInterval(id);
  }, [status, config.length]);

  function updateConfig(change: Partial<PendulumConfig>) {
    const next = { ...config, ...change };
    setConfig(next);
    setState(initialState(next));
  }

  function start() {
    setStatus("running");
  }

  function pause() {
    setStatus("paused");
  }

  function stop() {
    setStatus("stopped");
    setState(initialState(config));
  }

  return { config, state, status, start, pause, stop, updateConfig };
}
