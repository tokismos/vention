import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConfigPanel } from "@/components";

afterEach(cleanup);

describe("ConfigPanel", () => {
  it("sends the new anchor position when the anchor slider moves", () => {
    const onChange = vi.fn();
    render(
      <ConfigPanel
        config={{ angleDeg: 30, length: 2, mass: 1, anchorX: 1 }}
        disabled={false}
        onChange={onChange}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Anchor X/), { target: { value: "2.5" } });

    expect(onChange).toHaveBeenCalledWith({ anchorX: 2.5 });
  });
});
