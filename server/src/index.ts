import { createApp } from "@/api";
import { loadConfig } from "@/config";
import { createSimulation } from "@/simulation";

const { port } = loadConfig(process.env);

createApp(createSimulation()).listen(port, () => {
  console.log(`Pendulum server on http://localhost:${port}`);
});
