import express from "express";
import { step, type PendulumState } from "@/domain";

const PORT = 3001;
const DT = 1 / 60;
const LENGTH = 2;

let state: PendulumState = { angle: 0.5, velocity: 0 };

setInterval(() => {
  state = step(state, LENGTH, DT);
}, DT * 1000);

const app = express();

app.get("/state", (_req, res) => {
  res.json(state);
});

app.listen(PORT, () => {
  console.log(`Pendulum server on http://localhost:${PORT}`);
});
