import type { PendulumState } from "@shared";

const GRAVITY = 9.81;

export type StepInput = {
  state: PendulumState;
  length: number;
  dt: number;
};

export function step({ state, length, dt }: StepInput): PendulumState {
  const acceleration = -(GRAVITY / length) * Math.sin(state.angle);
  const velocity = state.velocity + acceleration * dt;
  const angle = state.angle + velocity * dt;
  return { angle, velocity };
}
