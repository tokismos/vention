import mqtt from "mqtt";

export type BusOptions = {
  brokerUrl: string;
  pendulumId: number;
};

export function presenceTopic(pendulumId: number): string {
  return `pendulum/${pendulumId}/presence`;
}

export function connectBus({ brokerUrl, pendulumId }: BusOptions) {
  const topic = presenceTopic(pendulumId);
  const client = mqtt.connect(brokerUrl, {
    clientId: `pendulum-${pendulumId}`,
    will: { topic, payload: "", qos: 1, retain: true },
  });

  client.on("connect", () => {
    client.publish(topic, JSON.stringify({ id: pendulumId }), { qos: 1, retain: true });
  });

  async function close() {
    if (client.connected) {
      await client.publishAsync(topic, "", { qos: 1, retain: true });
    }
    await client.endAsync();
  }

  return { close };
}
