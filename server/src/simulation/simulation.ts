import type { PendulumConfig, PendulumState, ServerState, Status } from "@shared";
import { step } from "@/physics";

const DT = 1 / 60;
const DEFAULT_CONFIG: PendulumConfig = { angleDeg: 30, length: 2, mass: 1 };

function initialState(config: PendulumConfig): PendulumState {
  return { angle: (config.angleDeg * Math.PI) / 180, velocity: 0 };
}

export type SimulationOptions = {
  id: number;
  config?: PendulumConfig;
};

export function createSimulation({
  id,
  config: initialConfig = DEFAULT_CONFIG,
}: SimulationOptions) {
  let config = initialConfig;
  let state: PendulumState = initialState(config);
  let status: Status = "stopped";
  let timer: NodeJS.Timeout | undefined;

  function tick() {
    state = step({ state, length: config.length, dt: DT });
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

  function setConfig(change: Partial<PendulumConfig>): boolean {
    if (status !== "stopped") return false;
    config = { ...config, ...change };
    state = initialState(config);
    return true;
  }

  function getState(): ServerState {
    return { id, status, config, ...state };
  }

  return { start, pause, stop, tick, setConfig, getState };
}

export type Simulation = ReturnType<typeof createSimulation>;
