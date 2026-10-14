import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSimulation } from "@/simulation";

describe("createSimulation", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("does not swing faster when Start is pressed twice", () => {
    const pressedOnce = createSimulation({ id: 1 });
    const pressedTwice = createSimulation({ id: 1 });

    pressedOnce.start();
    pressedTwice.start();
    pressedTwice.start();
    vi.advanceTimersByTime(1000);

    expect(pressedTwice.getState().angle).toBe(pressedOnce.getState().angle);
  });

  it("freezes the pendulum when paused", () => {
    const simulation = createSimulation({ id: 1 });

    simulation.start();
    vi.advanceTimersByTime(1000);
    simulation.pause();
    const angleAtPause = simulation.getState().angle;
    vi.advanceTimersByTime(5000);

    expect(simulation.getState().angle).toBe(angleAtPause);
  });

  it("continues from where it was paused", () => {
    const simulation = createSimulation({ id: 1 });

    simulation.start();
    vi.advanceTimersByTime(1000);
    simulation.pause();
    const { angle, velocity } = simulation.getState();
    simulation.start();

    expect(simulation.getState()).toMatchObject({ angle, velocity });
  });

  it("goes back to its starting position when stopped", () => {
    const simulation = createSimulation({ id: 1 });
    const startState = simulation.getState();

    simulation.start();
    vi.advanceTimersByTime(1000);
    simulation.stop();

    expect(simulation.getState()).toEqual(startState);
  });

  it("hangs each pendulum 1 m to the right of the previous one", () => {
    const anchors = [1, 2, 3].map((id) => createSimulation({ id }).getState().config.anchorX);

    expect(anchors).toEqual([1, 2, 3]);
  });
});
