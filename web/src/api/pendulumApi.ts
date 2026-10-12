import type { PendulumConfig, ServerState } from "@shared";
import { http } from "./axios";

export type Command = "start" | "pause" | "stop";

export async function fetchState(): Promise<ServerState> {
  const { data } = await http.get<ServerState>("/state");
  return data;
}

export async function sendCommand(command: Command): Promise<ServerState> {
  const { data } = await http.post<ServerState>(`/${command}`);
  return data;
}

export async function sendConfig(change: Partial<PendulumConfig>): Promise<ServerState> {
  const { data } = await http.post<ServerState>("/config", change);
  return data;
}
