import type { ServerState, Status } from "@shared";

export function overallStatus(pendulums: ServerState[]): Status {
  if (pendulums.some(({ status }) => status === "halted")) return "halted";
  if (pendulums.some(({ status }) => status === "running")) return "running";
  if (pendulums.some(({ status }) => status === "paused")) return "paused";
  return "stopped";
}
