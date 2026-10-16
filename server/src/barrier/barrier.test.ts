import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRestartBarrier, RESTART_DELAY_MS } from "@/barrier";

function setup(onlineIds: number[]) {
  const alive = new Set(onlineIds);
  const restart = vi.fn();
  const barrier = createRestartBarrier({ alive, restart });
  return { restart, barrier };
}

describe("createRestartBarrier", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("restarts 5 seconds after every online pendulum sent RESTART", () => {
    const { restart, barrier } = setup([1, 2]);

    barrier.restartHeard(1);
    barrier.restartHeard(2);
    vi.advanceTimersByTime(RESTART_DELAY_MS - 1);
    expect(restart).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(restart).toHaveBeenCalledOnce();
  });

  it("keeps waiting while one pendulum has not sent RESTART", () => {
    const { restart, barrier } = setup([1, 2, 3]);

    barrier.restartHeard(1);
    barrier.restartHeard(2);
    vi.advanceTimersByTime(60_000);

    expect(restart).not.toHaveBeenCalled();
  });

  it("starts a fresh count after a restart", () => {
    const { restart, barrier } = setup([1, 2]);

    barrier.restartHeard(1);
    barrier.restartHeard(2);
    vi.advanceTimersByTime(RESTART_DELAY_MS);
    barrier.restartHeard(1);
    vi.advanceTimersByTime(RESTART_DELAY_MS);

    expect(restart).toHaveBeenCalledOnce();
  });
});
