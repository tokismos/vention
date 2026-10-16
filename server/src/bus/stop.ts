import { STOP_TOPIC } from "@shared";
import type { BusClient } from "./types";

export function sendStop({ client, pendulumId }: BusClient) {
  client.publish(STOP_TOPIC, JSON.stringify({ from: pendulumId }), { qos: 1 });
}
