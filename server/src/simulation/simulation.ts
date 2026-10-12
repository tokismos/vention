import type { PendulumConfig, PendulumState, ServerState, Status } from "@shared";
import { step, initialState, DEFAULT_CONFIG } from "@/core";

const DT = 1 / 60;

export function createSimulation(config: PendulumConfig = DEFAULT_CONFIG) {
  let state: PendulumState = initialState(config);
  let status: Status = "stopped";
  let timer: NodeJS.Timeout | undefined;

  function tick() {
    state = step(state, config.length, DT);
  }

  function start() {
    if (status === "running") return;
    status = "running";
    timer = setInterval(tick, DT * 1000);
  }

  function pause() {
    if (status !== "running") return;
    clearInterval(timer);
    status = "paused";
  }

  function stop() {
    clearInterval(timer);
    status = "stopped";
    state = initialState(config);
  }

  function getState(): ServerState {
    return { status, ...state };
  }

  return { start, pause, stop, tick, getState };
}
