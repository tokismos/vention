import { useEffect, useState } from "react";
import type { PendulumConfig, ServerState } from "@shared";
import { fetchState, sendCommand, type Command } from "@/api";

const POLL_MS = 50;
const DEFAULT_CONFIG: PendulumConfig = { angleDeg: 30, length: 2, mass: 1 };

export function useSimulation() {
  const [config, setConfig] = useState<PendulumConfig>(DEFAULT_CONFIG);
  const [state, setState] = useState<ServerState | null>(null);

  useEffect(() => {
    async function poll() {
      try {
        setState(await fetchState());
      } catch {
        // Server unreachable: keep showing the last known state.
      }
    }

    poll();
    const id = setInterval(poll, POLL_MS);
    return () => clearInterval(id);
  }, []);

  async function run(command: Command) {
    try {
      setState(await sendCommand(command));
    } catch {
      // Server unreachable: nothing to update.
    }
  }

  function updateConfig(change: Partial<PendulumConfig>) {
    setConfig({ ...config, ...change });
  }

  return {
    config,
    state,
    status: state?.status ?? "stopped",
    start: () => run("start"),
    pause: () => run("pause"),
    stop: () => run("stop"),
    updateConfig,
  };
}
