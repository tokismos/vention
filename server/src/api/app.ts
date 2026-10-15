import express from "express";
import type { Simulation } from "@/simulation";
import { createRouter } from "./routes";

export function createApp(simulation: Simulation) {
  const app = express();
  app.use(express.json());
  app.use(createRouter(simulation));
  return app;
}
