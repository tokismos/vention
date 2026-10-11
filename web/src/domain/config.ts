import type { PendulumState } from "./physics";

export type PendulumConfig = {
  angleDeg: number;
  length: number;
  mass: number;
};

export const DEFAULT_CONFIG: PendulumConfig = { angleDeg: 30, length: 2, mass: 1 };

export function initialState(config: PendulumConfig): PendulumState {
  return { angle: (config.angleDeg * Math.PI) / 180, velocity: 0 };
}
