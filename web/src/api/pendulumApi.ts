import type { PendulumConfig, ServerState } from "@shared";
import { http } from "./axios";
import type { Command } from "./types";

export type CommandInput = {
  id: number;
  command: Command;
};

export type ConfigInput = {
  id: number;
  change: Partial<PendulumConfig>;
};

export async function fetchState(id: number): Promise<ServerState> {
  const { data } = await http.get<ServerState>(`/${id}/state`);
  return data;
}

export async function sendCommand({ id, command }: CommandInput): Promise<ServerState> {
  const { data } = await http.post<ServerState>(`/${id}/${command}`);
  return data;
}

export async function sendConfig({ id, change }: ConfigInput): Promise<ServerState> {
  const { data } = await http.post<ServerState>(`/${id}/config`, change);
  return data;
}
