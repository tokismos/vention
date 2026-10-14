import { z } from "zod";

const BASE_PORT = 3000;

const EnvSchema = z.object({
  PENDULUM_ID: z.coerce.number().int().min(1).default(1),
  PORT: z.coerce.number().int().min(1).max(65535).optional(),
});

export type Config = {
  pendulumId: number;
  port: number;
};

export function loadConfig(env: NodeJS.ProcessEnv): Config {
  const result = EnvSchema.safeParse(env);
  if (!result.success) {
    throw new Error(`Invalid environment variables:\n${z.prettifyError(result.error)}`);
  }

  const { PENDULUM_ID, PORT } = result.data;
  return { pendulumId: PENDULUM_ID, port: PORT ?? BASE_PORT + PENDULUM_ID };
}
