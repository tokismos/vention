import type { PendulumConfig, ServerState } from "@shared";

const SERVER_URL = "http://localhost:3001";

export type Command = "start" | "pause" | "stop";

export async function fetchState(): Promise<ServerState> {
  const response = await fetch(`${SERVER_URL}/state`);
  return response.json();
}

export async function sendCommand(command: Command): Promise<ServerState> {
  const response = await fetch(`${SERVER_URL}/${command}`, { method: "POST" });
  return response.json();
}

export async function sendConfig(change: Partial<PendulumConfig>): Promise<ServerState> {
  const response = await fetch(`${SERVER_URL}/config`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(change),
  });
  if (!response.ok) {
    throw new Error(`Config refused (${response.status})`);
  }
  return response.json();
}
