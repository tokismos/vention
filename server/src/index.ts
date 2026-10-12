import cors from "cors";
import express from "express";
import { createRouter } from "@/api";
import { createSimulation } from "@/simulation";

const PORT = Number(process.env.PORT ?? 3001);

const app = express();
app.use(cors());
app.use(express.json());
app.use(createRouter(createSimulation()));

app.listen(PORT, () => {
  console.log(`Pendulum server on http://localhost:${PORT}`);
});
