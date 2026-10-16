import type { PendulumConfig, PendulumState, ServerState, Status } from "@shared";
import { ballPosition, ballRadius, step } from "@/physics";

const DT = 1 / 60;
const ANCHOR_SPACING = 1;

function defaultConfig(id: number): PendulumConfig {
  return { angleDeg: 30, length: 2, mass: 1, anchorX: id * ANCHOR_SPACING };
}

function initialState(config: PendulumConfig): PendulumState {
  return { angle: (config.angleDeg * Math.PI) / 180, velocity: 0 };
}

export type SimulationOptions = {
  id: number;
  config?: PendulumConfig;
  onChange?: (state: ServerState) => void;
};

export function createSimulation({
  id,
  config: initialConfig = defaultConfig(id),
  onChange = () => {},
}: SimulationOptions) {
  let config = initialConfig;
  let state: PendulumState = initialState(config);
  let status: Status = "stopped";
  let timer: NodeJS.Timeout | undefined;

  function notify() {
    onChange(getState());
  }

  function tick() {
    state = step({ state, length: config.length, dt: DT });
    notify();
  }

  function run() {
    status = "running";
    timer = setInterval(tick, DT * 1000);
    notify();
  }

  function freeze(frozenStatus: Status) {
    if (status !== "running") return;
    clearInterval(timer);
    status = frozenStatus;
    notify();
  }

  function start() {
    if (status === "running" || status === "halted") return;
    run();
  }

  function pause() {
    freeze("paused");
  }

  function halt() {
    freeze("halted");
  }

  function restart() {
    if (status !== "halted") return;
    state = initialState(config);
    run();
  }

  function stop() {
    clearInterval(timer);
    status = "stopped";
    state = initialState(config);
    notify();
  }

  function setConfig(change: Partial<PendulumConfig>): boolean {
    if (status !== "stopped") return false;
    config = { ...config, ...change };
    state = initialState(config);
    notify();
    return true;
  }

  function getState(): ServerState {
    const position = ballPosition({
      anchorX: config.anchorX,
      length: config.length,
      angle: state.angle,
    });
    return { id, status, config, ...state, ball: { ...position, radius: ballRadius(config.mass) } };
  }

  return { start, pause, halt, restart, stop, tick, setConfig, getState };
}
