import type { Collision, ServerState } from "@shared";
import { describe, expect, it } from "vitest";
import { toSnapshot } from "./snapshot";

const COLLISION: Collision = [2, 3];

function liveWith(pendulums: Partial<ServerState>[]) {
  const states = new Map(pendulums.map((pendulum, index) => [index + 1, pendulum as ServerState]));
  return { connection: "online" as const, alive: new Set(states.keys()), states };
}

describe("toSnapshot", () => {
  it("shows the collision a halted pendulum reports", () => {
    const live = liveWith([{ collision: null }, { collision: COLLISION }]);

    expect(toSnapshot(live).collision).toEqual(COLLISION);
  });

  it("shows no collision when no pendulum reports one", () => {
    const live = liveWith([{ collision: null }, { collision: null }]);

    expect(toSnapshot(live).collision).toBeNull();
  });
});
