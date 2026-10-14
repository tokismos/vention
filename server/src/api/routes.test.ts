import request from "supertest";
import { describe, expect, it, onTestFinished } from "vitest";
import { createApp } from "@/api";
import { createSimulation } from "@/simulation";

describe("GET /state", () => {
  it("says which pendulum answers", async () => {
    const app = createApp(createSimulation(3));

    const response = await request(app).get("/state");

    expect(response.body.id).toBe(3);
  });
});

describe("POST /config", () => {
  it("accepts a valid change while the pendulum is stopped", async () => {
    const app = createApp(createSimulation(1));

    const response = await request(app).post("/config").send({ angleDeg: 45 });

    expect(response.status).toBe(200);
    expect(response.body.config.angleDeg).toBe(45);
    expect(response.body.angle).toBeCloseTo(Math.PI / 4);
  });

  it.each([
    { reason: "a length above 3", settings: { length: 10 } },
    { reason: "a length sent as text", settings: { length: "2" } },
    { reason: "an unknown setting", settings: { gravity: 5 } },
  ])("refuses $reason", async ({ settings }) => {
    const app = createApp(createSimulation(1));

    const response = await request(app).post("/config").send(settings);

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual(expect.any(String));
  });

  it("refuses a change while the pendulum is running", async () => {
    const simulation = createSimulation(1);
    onTestFinished(() => simulation.stop());
    const app = createApp(simulation);

    await request(app).post("/start");
    const response = await request(app).post("/config").send({ length: 1 });

    expect(response.status).toBe(409);
    expect(response.body.error).toEqual(expect.any(String));
  });
});
