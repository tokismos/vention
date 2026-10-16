import type { Collision, ServerState } from "@shared";
import { createApp } from "@/api";
import { createRestartBarrier } from "@/barrier";
import { connectBus } from "@/bus";
import { loadConfig } from "@/config";
import { findCollision } from "@/physics";
import { createSimulation } from "@/simulation";

const { pendulumId, port, brokerUrl } = loadConfig(process.env);

const { publishState, neighbors, stopAll, restartAll, onOffline, onStop, onRestart, close } =
  connectBus({ brokerUrl, pendulumId });
const simulation = createSimulation({ id: pendulumId, onChange: handleChange });
const barrier = createRestartBarrier({ alive: neighbors.alive, restart: simulation.restart });

onOffline(simulation.pause);
onStop((collision) => {
  simulation.halt(collision);
  restartAll();
});
onRestart(barrier.restartHeard);
publishState(simulation.getState());

function handleChange(state: ServerState) {
  publishState(state);
  if (state.status !== "running") return;
  const other = findCollision({ self: state, live: neighbors });
  if (!other) return;
  const collision: Collision = [state.id, other.id];
  simulation.halt(collision);
  stopAll(collision);
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
