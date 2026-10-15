import { createApp } from "@/api";
import { connectBus } from "@/bus";
import { loadConfig } from "@/config";
import { createSimulation } from "@/simulation";

const { pendulumId, port, brokerUrl } = loadConfig(process.env);

createApp(createSimulation({ id: pendulumId })).listen(port, () => {
  console.log(`Pendulum ${pendulumId} on http://localhost:${port}`);
});

const { close } = connectBus({ brokerUrl, pendulumId });

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, async () => {
    await close();
    process.exit(0);
  });
}
