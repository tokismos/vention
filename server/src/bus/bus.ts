import { RESTART_TOPIC, STOP_TOPIC } from "@shared";
import mqtt from "mqtt";
import { watchNeighbors } from "./neighbors";
import { announcePresence, clearPresence, presenceWill } from "./presence";
import { createStatePublisher } from "./state";
export type BusOptions = {
  brokerUrl: string;
  pendulumId: number;
};

export function connectBus({ brokerUrl, pendulumId }: BusOptions) {
  const client = mqtt.connect(brokerUrl, {
    clientId: `pendulum-${pendulumId}`,
    will: presenceWill(pendulumId),
    queueQoSZero: false,
  });
  const state = createStatePublisher({ client, pendulumId });
  const neighbors = watchNeighbors(client);

  client.on("connect", () => {
    announcePresence({ client, pendulumId });
    state.republish();
    client.subscribe([STOP_TOPIC, RESTART_TOPIC], { qos: 1 });
  });

  function announce(topic: string) {
    client.publish(topic, JSON.stringify({ from: pendulumId }), { qos: 1 });
  }

  function onOffline(handler: () => void) {
    client.on("offline", handler);
  }

  function onStop(handler: () => void) {
    client.on("message", (topic) => {
      if (topic === STOP_TOPIC) handler();
    });
  }

  function onRestart(handler: (pendulumId: number) => void) {
    client.on("message", (topic, payload) => {
      if (topic === RESTART_TOPIC) handler(JSON.parse(payload.toString()).from);
    });
  }

  async function close() {
    if (client.connected) await Promise.all([state.clear(), clearPresence({ client, pendulumId })]);
    await client.endAsync();
  }

  return {
    publishState: state.publish,
    neighbors,
    stopAll: () => announce(STOP_TOPIC),
    restartAll: () => announce(RESTART_TOPIC),
    onOffline,
    onStop,
    onRestart,
    close,
  };
}
