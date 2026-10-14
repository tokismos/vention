import { describe, expect, it } from "vitest";
import type { PendulumState } from "@shared";
import { step } from "@/physics";

const DT = 1 / 60;
const LENGTH = 2;
const TEN_MINUTES = 10 * 60 * 60;
const FIVE_SECONDS = 5 * 60;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
const toDegrees = (radians: number) => (radians * 180) / Math.PI;

describe("step", () => {
  it("still swings up to 30 degrees after 10 minutes", () => {
    let state: PendulumState = { angle: toRadians(30), velocity: 0 };

    for (let i = 0; i < TEN_MINUTES; i++) {
      state = step({ state, length: LENGTH, dt: DT });
    }

    let highestAngle = 0;
    for (let i = 0; i < FIVE_SECONDS; i++) {
      state = step({ state, length: LENGTH, dt: DT });
      highestAngle = Math.max(highestAngle, toDegrees(state.angle));
    }

    expect(highestAngle).toBeCloseTo(30, 0);
  });
});
