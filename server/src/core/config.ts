import { z } from "zod";
import type { PendulumConfig, PendulumState } from "@shared";

export const DEFAULT_CONFIG: PendulumConfig = { angleDeg: 30, length: 2, mass: 1 };

export const ConfigChangeSchema = z
  .strictObject({
    angleDeg: z.number().min(-90).max(90),
    length: z.number().min(0.5).max(3),
    mass: z.number().min(0.5).max(5),
  })
  .partial();

export function initialState(config: PendulumConfig): PendulumState {
  return { angle: (config.angleDeg * Math.PI) / 180, velocity: 0 };
}
