const GRAVITY = 9.81;

export type PendulumState = {
  angle: number;
  velocity: number;
};

export function step(state: PendulumState, length: number, dt: number): PendulumState {
  const acceleration = -(GRAVITY / length) * Math.sin(state.angle);
  const velocity = state.velocity + acceleration * dt;
  const angle = state.angle + velocity * dt;
  return { angle, velocity };
}
