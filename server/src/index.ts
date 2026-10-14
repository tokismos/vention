import { createApp } from "@/api";
import { loadConfig } from "@/config";
import { createSimulation } from "@/simulation";

const { pendulumId, port } = loadConfig(process.env);

createApp(createSimulation({ id: pendulumId })).listen(port, () => {
  console.log(`Pendulum ${pendulumId} on http://localhost:${port}`);
});
