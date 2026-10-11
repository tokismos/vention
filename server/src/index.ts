import cors from "cors";
import express from "express";
import { createSimulation } from "@/simulation";

const PORT = Number(process.env.PORT ?? 3001);

const simulation = createSimulation();
simulation.start();

const app = express();
app.use(cors());

app.get("/state", (_req, res) => {
  res.json(simulation.getState());
});

app.listen(PORT, () => {
  console.log(`Pendulum server on http://localhost:${PORT}`);
});
