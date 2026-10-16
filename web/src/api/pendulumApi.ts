import type { PendulumConfig, ServerState } from "@shared";
import { http } from "./axios";
import type { Command } from "./types";

type CommandInput = {
  id: number;
  command: Command;
};

type ConfigInput = {
  id: number;
  change: Partial<PendulumConfig>;
};

type CommandToAllInput = {
  ids: number[];
  command: Command;
};

function unreachableMessage(ids: number[]): string {
  return `Could not reach ${ids.length === 1 ? "pendulum" : "pendulums"} ${ids.join(", ")}`;
}

export async function sendCommand({ id, command }: CommandInput): Promise<ServerState> {
  const { data } = await http.post<ServerState>(`/${id}/${command}`);
  return data;
}

export async function sendCommandToAll({ ids, command }: CommandToAllInput): Promise<void> {
  const answers = await Promise.allSettled(ids.map((id) => sendCommand({ id, command })));
  const failedIds = ids.filter((_, index) => answers[index].status === "rejected");
  if (failedIds.length > 0) throw new Error(unreachableMessage(failedIds));
}

export async function sendConfig({ id, change }: ConfigInput): Promise<ServerState> {
  const { data } = await http.post<ServerState>(`/${id}/config`, change);
  return data;
}
