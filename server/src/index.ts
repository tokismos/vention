import type { ServerState } from "@shared";
import { createApp } from "@/api";
import { connectBus } from "@/bus";
import { loadConfig } from "@/config";
import { findCollision } from "@/physics";
import { createSimulation } from "@/simulation";

const { pendulumId, port, brokerUrl } = loadConfig(process.env);

const { publishState, neighbors, stopAll, onOffline, onStop, close } = connectBus({
  brokerUrl,
  pendulumId,
});
const simulation = createSimulation({ id: pendulumId, onChange: handleChange });
onOffline(simulation.pause);
onStop(simulation.halt);
publishState(simulation.getState());

function handleChange(state: ServerState) {
  publishState(state);
  if (state.status === "running" && findCollision({ self: state, live: neighbors })) {
    simulation.halt();
    stopAll();
  }
}

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
