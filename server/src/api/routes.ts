import { Router } from "express";
import { z } from "zod";
import type { Simulation } from "@/simulation";

const ConfigChangeSchema = z
  .strictObject({
    angleDeg: z.number().min(-90).max(90),
    length: z.number().min(0.5).max(3),
    mass: z.number().min(0.5).max(5),
  })
  .partial();

export function createRouter(simulation: Simulation) {
  const router = Router();

  router.get("/state", (_req, res) => {
    res.json(simulation.getState());
  });

  router.post("/start", (_req, res) => {
    simulation.start();
    res.json(simulation.getState());
  });

  router.post("/pause", (_req, res) => {
    simulation.pause();
    res.json(simulation.getState());
  });

  router.post("/stop", (_req, res) => {
    simulation.stop();
    res.json(simulation.getState());
  });

  router.post("/config", (req, res) => {
    const result = ConfigChangeSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: z.prettifyError(result.error) });
      return;
    }

    if (!simulation.setConfig(result.data)) {
      res.status(409).json({ error: "Stop the simulation before changing its config" });
      return;
    }

    res.json(simulation.getState());
  });

  return router;
}
