import { useEffect, useState } from "react";
import type { PendulumConfig, ServerState } from "@shared";
import { fetchState, sendCommand, sendConfig, type Command } from "@/api";

const POLL_MS = 50;

export function useSimulation() {
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

  async function updateConfig(change: Partial<PendulumConfig>) {
    try {
      setState(await sendConfig(change));
    } catch {
      // Refused or unreachable: the next poll shows the server's real config.
    }
  }

  return {
    state,
    status: state?.status ?? "stopped",
    start: () => run("start"),
    pause: () => run("pause"),
    stop: () => run("stop"),
    updateConfig,
  };
}
