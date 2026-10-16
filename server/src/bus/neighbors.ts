import { applyMessage, createLiveState, EVERY_PRESENCE, EVERY_STATE } from "@shared";
import type { LiveState } from "@shared";
import type { MqttClient } from "mqtt";

export function watchNeighbors(client: MqttClient): LiveState {
  const live = createLiveState();

  client.on("connect", () => {
    live.alive.clear();
    live.states.clear();
    client.subscribe([EVERY_PRESENCE, EVERY_STATE]);
  });

  client.on("message", (topic, payload) => {
    applyMessage({ ...live, topic, text: payload.toString() });
  });

  return live;
}
