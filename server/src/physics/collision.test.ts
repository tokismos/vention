import { describe, expect, it } from "vitest";
import { COLLISION_GAP } from "@shared";
import type { ServerState } from "@shared";
import { collides, findCollision } from "@/physics";

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
    expect(collides({ a: ballAt(0), b: ballAt(touching) })).toBe(true);
  });

  it("is false just beyond the gap", () => {
    const apart = 2 * RADIUS + COLLISION_GAP + 0.001;
    expect(collides({ a: ballAt(0), b: ballAt(apart) })).toBe(false);
  });
});

function pendulumAt({ id, x }: { id: number; x: number }): ServerState {
  return {
    id,
    status: "running",
    config: { angleDeg: 30, length: 2, mass: 1, anchorX: id },
    angle: 0,
    velocity: 0,
    ball: { x, y: 2, radius: 0.1 },
    collision: null,
  };
}

function liveWith({ online, offline = [] }: { online: ServerState[]; offline?: ServerState[] }) {
  return {
    alive: new Set(online.map(({ id }) => id)),
    states: new Map([...online, ...offline].map((pendulum) => [pendulum.id, pendulum])),
  };
}

describe("findCollision", () => {
  const self = pendulumAt({ id: 1, x: 1 });

  it("finds the neighbor whose ball touches ours", () => {
    const neighbor = pendulumAt({ id: 2, x: 1.2 });
    const live = liveWith({ online: [self, neighbor] });

    expect(findCollision({ self, live })?.id).toBe(2);
  });

  it("finds nothing when every neighbor is far away", () => {
    const live = liveWith({ online: [self, pendulumAt({ id: 2, x: 2 })] });

    expect(findCollision({ self, live })).toBeUndefined();
  });

  it("never collides with itself", () => {
    const live = liveWith({ online: [self] });

    expect(findCollision({ self, live })).toBeUndefined();
  });

  it("ignores a crashed neighbor whose last state is still kept", () => {
    const crashed = pendulumAt({ id: 2, x: 1.2 });
    const live = liveWith({ online: [self], offline: [crashed] });

    expect(findCollision({ self, live })).toBeUndefined();
  });
});
