import type { Ball } from "@shared";
import { COLLISION_GAP } from "@shared";

export type CollisionInput = {
  a: Ball;
  b: Ball;
};

export function collides({ a, b }: CollisionInput): boolean {
  const distance = Math.hypot(a.x - b.x, a.y - b.y);
  return distance <= a.radius + b.radius + COLLISION_GAP;
}
