import type { MqttClient } from "mqtt";

export type BusClient = {
  client: MqttClient;
  pendulumId: number;
};
