import type { Ball, LiveState, ServerState } from "@shared";
import { COLLISION_GAP } from "@shared";

export type CollisionInput = {
  a: Ball;
  b: Ball;
};

export type FindCollisionInput = {
  self: ServerState;
  live: LiveState;
};

export function collides({ a, b }: CollisionInput): boolean {
  const distance = Math.hypot(a.x - b.x, a.y - b.y);
  return distance <= a.radius + b.radius + COLLISION_GAP;
}

export function findCollision({ self, live }: FindCollisionInput): ServerState | undefined {
  return [...live.states.values()].find(
    (other) =>
      other.id !== self.id &&
      live.alive.has(other.id) &&
      other.status !== "halted" &&
      collides({ a: self.ball, b: other.ball }),
  );
}
