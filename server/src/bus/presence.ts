import { presenceTopic } from "@shared";
import type { IClientOptions } from "mqtt";
import { KEPT } from "./options";
import type { BusClient } from "./types";

export function presenceWill(pendulumId: number): IClientOptions["will"] {
  return { topic: presenceTopic(pendulumId), payload: "", ...KEPT };
}

export function announcePresence({ client, pendulumId }: BusClient) {
  client.publish(presenceTopic(pendulumId), JSON.stringify({ id: pendulumId }), KEPT);
}

export async function clearPresence({ client, pendulumId }: BusClient) {
  await client.publishAsync(presenceTopic(pendulumId), "", KEPT);
}
