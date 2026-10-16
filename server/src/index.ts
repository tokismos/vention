import { createApp } from "@/api";
import { connectBus } from "@/bus";
import { loadConfig } from "@/config";
import { createSimulation } from "@/simulation";

const { pendulumId, port, brokerUrl } = loadConfig(process.env);

const { publishState, onOffline, close } = connectBus({ brokerUrl, pendulumId });
const simulation = createSimulation({ id: pendulumId, onChange: publishState });
onOffline(simulation.pause);
publishState(simulation.getState());

createApp(simulation).listen(port, () => {
  console.log(`Pendulum ${pendulumId} on http://localhost:${port}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, async () => {
    simulation.stop();
    await close();
    process.exit(0);
  });
}
