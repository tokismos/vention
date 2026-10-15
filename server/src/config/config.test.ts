import { describe, expect, it } from "vitest";
import { loadConfig } from "@/config";

describe("loadConfig", () => {
  it("runs pendulum 1 on port 3001 when nothing is set", () => {
    expect(loadConfig({})).toEqual({ pendulumId: 1, port: 3001 });
  });

  it("picks the port from the pendulum id", () => {
    expect(loadConfig({ PENDULUM_ID: "3" })).toEqual({ pendulumId: 3, port: 3003 });
  });

  it("uses PORT when it is set", () => {
    expect(loadConfig({ PENDULUM_ID: "3", PORT: "4000" })).toEqual({ pendulumId: 3, port: 4000 });
  });

  it.each(["abc", "0", "1.5"])("refuses the pendulum id %s", (id) => {
    expect(() => loadConfig({ PENDULUM_ID: id })).toThrow("PENDULUM_ID");
  });
});
