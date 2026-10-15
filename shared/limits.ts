import type { Limit, PendulumConfig } from "./types";

export const LIMITS: Record<keyof PendulumConfig, Limit> = {
  angleDeg: { min: -90, max: 90 },
  length: { min: 0.5, max: 3 },
  mass: { min: 0.5, max: 5 },
  anchorX: { min: 0, max: 10 },
};

export const MAX_BALL_RADIUS = 0.3;
