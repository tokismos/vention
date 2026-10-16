import mqtt from "mqtt";
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

  client.on("connect", () => {
    announcePresence({ client, pendulumId });
    state.republish();
  });

  function onOffline(handler: () => void) {
    client.on("offline", handler);
  }

  async function close() {
    if (client.connected) await Promise.all([state.clear(), clearPresence({ client, pendulumId })]);
    await client.endAsync();
  }

  return { publishState: state.publish, onOffline, close };
}
