import type { Status } from "@shared";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Controls } from "@/components";

afterEach(cleanup);

function renderControls(status: Status) {
  render(<Controls status={status} onStart={() => {}} onPause={() => {}} onStop={() => {}} />);
}

function isEnabled(name: string) {
  return !screen.getByRole<HTMLButtonElement>("button", { name }).disabled;
}

describe("Controls", () => {
  it("allows only Start when stopped", () => {
    renderControls("stopped");

    expect(isEnabled("Start")).toBe(true);
    expect(isEnabled("Pause")).toBe(false);
    expect(isEnabled("Stop")).toBe(false);
  });

  it("allows Pause and Stop when running", () => {
    renderControls("running");

    expect(isEnabled("Start")).toBe(false);
    expect(isEnabled("Pause")).toBe(true);
    expect(isEnabled("Stop")).toBe(true);
  });

  it("allows Start and Stop when paused", () => {
    renderControls("paused");

    expect(isEnabled("Start")).toBe(true);
    expect(isEnabled("Pause")).toBe(false);
    expect(isEnabled("Stop")).toBe(true);
  });
});
