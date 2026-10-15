import type { ServerState } from "@shared";
import { KEPT } from "./options";
import { stateTopic } from "./topics";
import type { BusClient } from "./types";

export function createStatePublisher({ client, pendulumId }: BusClient) {
  const topic = stateTopic(pendulumId);
  let lastState: ServerState | undefined;

  function send(state: ServerState) {
    client.publish(topic, JSON.stringify(state), { qos: 0, retain: true });
  }

  function publish(state: ServerState) {
    lastState = state;
    send(state);
  }

  function republish() {
    if (lastState) send(lastState);
  }

  async function clear() {
    await client.publishAsync(topic, "", KEPT);
  }

  return { publish, republish, clear };
}
