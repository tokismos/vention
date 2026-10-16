import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CollisionBanner } from "@/components";

describe("CollisionBanner", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("names the two pendulums that collided", () => {
    render(<CollisionBanner collision={[2, 3]} />);

    expect(screen.getByText(/Pendulums 2 and 3 collided/)).toBeTruthy();
  });

  it("counts down the seconds until the restart", () => {
    render(<CollisionBanner collision={[2, 3]} />);
    expect(screen.getByText(/Restarting in 5 s/)).toBeTruthy();

    act(() => vi.advanceTimersByTime(2000));

    expect(screen.getByText(/Restarting in 3 s/)).toBeTruthy();
  });
});
