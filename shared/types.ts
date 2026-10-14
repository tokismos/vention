export type Status = "running" | "paused" | "stopped";

export type PendulumState = {
  angle: number;
  velocity: number;
};

export type PendulumConfig = {
  angleDeg: number;
  length: number;
  mass: number;
  anchorX: number;
};

export type ServerState = PendulumState & {
  id: number;
  status: Status;
  config: PendulumConfig;
};
