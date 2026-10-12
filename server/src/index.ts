import cors from "cors";
import express from "express";
import { z } from "zod";
import { ConfigChangeSchema } from "@/core";
import { createSimulation } from "@/simulation";

const PORT = Number(process.env.PORT ?? 3001);

const simulation = createSimulation();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/state", (_req, res) => {
  res.json(simulation.getState());
});

app.post("/start", (_req, res) => {
  simulation.start();
  res.json(simulation.getState());
});

app.post("/pause", (_req, res) => {
  simulation.pause();
  res.json(simulation.getState());
});

app.post("/stop", (_req, res) => {
  simulation.stop();
  res.json(simulation.getState());
});

app.post("/config", (req, res) => {
  const result = ConfigChangeSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json(z.flattenError(result.error));
    return;
  }

  if (!simulation.setConfig(result.data)) {
    res.status(409).json({ error: "Stop the simulation before changing its config" });
    return;
  }

  res.json(simulation.getState());
});

app.listen(PORT, () => {
  console.log(`Pendulum server on http://localhost:${PORT}`);
});
