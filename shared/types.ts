export type Status = "running" | "paused" | "stopped";

export type PendulumState = {
  angle: number;
  velocity: number;
};

export type PendulumConfig = {
  angleDeg: number;
  length: number;
  mass: number;
};

export type ServerState = PendulumState & {
  status: Status;
  config: PendulumConfig;
};
