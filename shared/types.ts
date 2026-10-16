export type Status = "running" | "paused" | "stopped" | "halted";

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

export type Collision = [number, number];

export type ServerState = PendulumState & {
  id: number;
  status: Status;
  config: PendulumConfig;
  ball: Ball;
  collision: Collision | null;
};

export type LiveState = {
  alive: Set<number>;
  states: Map<number, ServerState>;
};

export type PendulumMessage = {
  topic: string;
  text: string;
};
