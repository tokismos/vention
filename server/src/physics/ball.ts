import { LIMITS, MAX_BALL_RADIUS } from "@shared";

export type BallPositionInput = {
  anchorX: number;
  length: number;
  angle: number;
};

export function ballPosition({ anchorX, length, angle }: BallPositionInput) {
  return { x: anchorX + length * Math.sin(angle), y: length * Math.cos(angle) };
}

export function ballRadius(mass: number): number {
  return MAX_BALL_RADIUS * Math.cbrt(mass / LIMITS.mass.max);
}
