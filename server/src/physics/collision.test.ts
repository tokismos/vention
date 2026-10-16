import { describe, expect, it } from "vitest";
import { COLLISION_GAP } from "@shared";
import { collides } from "@/physics";

const RADIUS = 0.1;

function ballAt(x: number) {
  return { x, y: 2, radius: RADIUS };
}

describe("collides", () => {
  it("is true when the balls overlap", () => {
    expect(collides({ a: ballAt(1), b: ballAt(1.1) })).toBe(true);
  });

  it("is false when the balls are far apart", () => {
    expect(collides({ a: ballAt(1), b: ballAt(2) })).toBe(false);
  });

  it("is true when the balls are exactly the gap apart", () => {
    const touching = 2 * RADIUS + COLLISION_GAP;
    expect(collides({ a: ballAt(1), b: ballAt(1 + touching) })).toBe(true);
  });

  it("is false just beyond the gap", () => {
    const apart = 2 * RADIUS + COLLISION_GAP + 0.001;
    expect(collides({ a: ballAt(1), b: ballAt(1 + apart) })).toBe(false);
  });
});
