import type { ServerState, Status } from "@shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import App from "@/App";

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => {
  cleanup();
  server.resetHandlers();
  vi.unstubAllEnvs();
});
afterAll(() => server.close());

function pendulumState({
  id = 1,
  status,
  angle = 0,
  anchorX = 1,
}: {
  id?: number;
  status: Status;
  angle?: number;
  anchorX?: number;
}): ServerState {
  return {
    id,
    status,
    config: { angleDeg: 30, length: 2, mass: 1, anchorX },
    angle,
    velocity: 0,
    ball: { x: anchorX + 2 * Math.sin(angle), y: 2 * Math.cos(angle), radius: 0.2 },
  };
}

function serverReturns(status: Status) {
  server.use(http.get("*/api/1/state", () => HttpResponse.json(pendulumState({ status }))));
}

function serverSwings() {
  let angle = 0.5;
  server.use(
    http.get("*/api/1/state", () => {
      angle -= 0.1;
      return HttpResponse.json(pendulumState({ status: "running", angle }));
    }),
  );
}

function renderApp() {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <App />
    </QueryClientProvider>,
  );
}

describe("App", () => {
  it("locks the sliders while the pendulum is running", async () => {
    serverReturns("running");
    renderApp();

    const sliders = await screen.findAllByRole<HTMLInputElement>("slider");

    expect(sliders.every((slider) => slider.disabled)).toBe(true);
  });

  it("unlocks the sliders when the pendulum is stopped", async () => {
    serverReturns("stopped");
    renderApp();

    const sliders = await screen.findAllByRole<HTMLInputElement>("slider");

    expect(sliders.every((slider) => !slider.disabled)).toBe(true);
  });

  it("moves the pendulum while it is running", async () => {
    serverSwings();
    const { container } = renderApp();
    const ballX = () => container.querySelector("circle")?.getAttribute("cx");

    await waitFor(() => expect(ballX()).toBeDefined());
    const firstX = ballX();

    await waitFor(() => expect(ballX()).not.toBe(firstX));
  });

  it("draws the pendulum of every server at its own anchor", async () => {
    vi.stubEnv("VITE_PENDULUM_COUNT", "3");
    server.use(
      http.get("*/api/:id/state", ({ params }) => {
        const id = Number(params.id);
        return HttpResponse.json(pendulumState({ id, anchorX: id, status: "stopped" }));
      }),
    );
    const { container } = renderApp();
    const ballsX = () =>
      [...container.querySelectorAll("circle")].map((ball) => ball.getAttribute("cx"));

    await waitFor(() => expect(ballsX()).toEqual(["1", "2", "3"]));
  });

  it("edits the pendulum you pick", async () => {
    vi.stubEnv("VITE_PENDULUM_COUNT", "3");
    const configured: number[] = [];
    server.use(
      http.get("*/api/:id/state", ({ params }) =>
        HttpResponse.json(pendulumState({ id: Number(params.id), status: "stopped" })),
      ),
      http.post("*/api/:id/config", ({ params }) => {
        const id = Number(params.id);
        configured.push(id);
        return HttpResponse.json(pendulumState({ id, status: "stopped" }));
      }),
    );
    renderApp();

    fireEvent.click(await screen.findByRole("button", { name: "Pendulum 2" }));
    fireEvent.change(await screen.findByRole("slider", { name: /Length/ }), {
      target: { value: "1.5" },
    });

    await waitFor(() => expect(configured).toEqual([2]));
  });
});
