import type { ServerState, Status } from "@shared";
import { describe, expect, it } from "vitest";
import { overallStatus } from "./overallStatus";

function pendulumsWith(...statuses: Status[]) {
  return statuses.map((status) => ({ status }) as ServerState);
}

describe("overallStatus", () => {
  it("is halted when any pendulum is halted, even if others still run", () => {
    expect(overallStatus(pendulumsWith("running", "halted", "paused"))).toBe("halted");
  });

  it("is running when one runs and none is halted", () => {
    expect(overallStatus(pendulumsWith("stopped", "running", "paused"))).toBe("running");
  });

  it("is stopped when there are no pendulums", () => {
    expect(overallStatus([])).toBe("stopped");
  });
});
