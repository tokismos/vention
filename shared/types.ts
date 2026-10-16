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

export type Limit = {
  min: number;
  max: number;
};

export type Ball = {
  x: number;
  y: number;
  radius: number;
};

export type ServerState = PendulumState & {
  id: number;
  status: Status;
  config: PendulumConfig;
  ball: Ball;
};

export type LiveState = {
  alive: Set<number>;
  states: Map<number, ServerState>;
};

export type PendulumMessage = {
  topic: string;
  text: string;
};
