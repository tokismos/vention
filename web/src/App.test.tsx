import type { ServerState, Status } from "@shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import App from "@/App";

const CORS = { "Access-Control-Allow-Origin": "*" };

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());

function pendulumState({ status, angle = 0 }: { status: Status; angle?: number }): ServerState {
  return {
    id: 1,
    status,
    config: { angleDeg: 30, length: 2, mass: 1, anchorX: 1 },
    angle,
    velocity: 0,
  };
}

function serverReturns(status: Status) {
  server.use(
    http.get("*/state", () => HttpResponse.json(pendulumState({ status }), { headers: CORS })),
  );
}

function serverSwings() {
  let angle = 0.5;
  server.use(
    http.get("*/state", () => {
      angle -= 0.1;
      return HttpResponse.json(pendulumState({ status: "running", angle }), { headers: CORS });
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
});
