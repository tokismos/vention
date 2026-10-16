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

  it("freezes the pendulum when halted", () => {
    const simulation = createSimulation({ id: 1 });

    simulation.start();
    vi.advanceTimersByTime(1000);
    simulation.halt();
    const angleAtHalt = simulation.getState().angle;
    vi.advanceTimersByTime(5000);

    expect(simulation.getState()).toMatchObject({ status: "halted", angle: angleAtHalt });
  });

  it("ignores Start while halted, so only a restart can move it again", () => {
    const simulation = createSimulation({ id: 1 });

    simulation.start();
    simulation.halt();
    simulation.start();

    expect(simulation.getState().status).toBe("halted");
  });

  it("restarts from its starting position", () => {
    const simulation = createSimulation({ id: 1 });
    const startAngle = simulation.getState().angle;

    simulation.start();
    vi.advanceTimersByTime(1000);
    simulation.halt();
    simulation.restart();

    expect(simulation.getState()).toMatchObject({
      status: "running",
      angle: startAngle,
      velocity: 0,
    });
  });

  it("does not restart a pendulum that was stopped during the halt", () => {
    const simulation = createSimulation({ id: 1 });

    simulation.start();
    simulation.halt();
    simulation.stop();
    simulation.restart();

    expect(simulation.getState().status).toBe("stopped");
  });

  it("hangs each pendulum 1 m to the right of the previous one", () => {
    const anchors = [1, 2, 3].map((id) => createSimulation({ id }).getState().config.anchorX);

    expect(anchors).toEqual([1, 2, 3]);
  });
});
