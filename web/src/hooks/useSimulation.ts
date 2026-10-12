import { useEffect, useState } from "react";
import type { PendulumConfig, ServerState } from "@shared";
import { fetchState, sendCommand, sendConfig, type Command } from "@/api";
import type { Connection } from "@/types";

const POLL_MS = 50;

export function useSimulation() {
  const [state, setState] = useState<ServerState | null>(null);
  const [connection, setConnection] = useState<Connection>("connecting");

  useEffect(() => {
    async function poll() {
      try {
        setState(await fetchState());
        setConnection("online");
      } catch {
        setConnection("offline");
      }
    }

    poll();
    const id = setInterval(poll, POLL_MS);
    return () => clearInterval(id);
  }, []);

  async function run(command: Command) {
    try {
      setState(await sendCommand(command));
    } catch {}
  }

  async function updateConfig(change: Partial<PendulumConfig>) {
    try {
      setState(await sendConfig(change));
    } catch {}
  }

  return {
    state,
    connection,
    status: state?.status ?? "stopped",
    start: () => run("start"),
    pause: () => run("pause"),
    stop: () => run("stop"),
    updateConfig,
  };
}
