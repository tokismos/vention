import { useMutation } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import type { ServerState, Status } from "@shared";
import { sendCommandToAll, sendConfig, type Command } from "@/api";
import { pendulumFeed } from "@/bus";

function overallStatus(pendulums: ServerState[]): Status {
  if (pendulums.some(({ status }) => status === "running")) return "running";
  if (pendulums.some(({ status }) => status === "paused")) return "paused";
  return "stopped";
}

export function usePendulums() {
  const { subscribe, getSnapshot } = pendulumFeed();
  const { connection, ids, pendulums, offlineIds } = useSyncExternalStore(subscribe, getSnapshot);
  const onlineIds = pendulums.map(({ id }) => id);

  const { mutate: runAll, error: commandError } = useMutation({
    mutationFn: (command: Command) => sendCommandToAll({ ids: onlineIds, command }),
  });
  const { mutate: updateConfig, error: configError } = useMutation({ mutationFn: sendConfig });

  return {
    connection,
    ids,
    pendulums,
    offlineIds,
    status: overallStatus(pendulums),
    commandError: commandError?.message ?? null,
    configError: configError?.message ?? null,
    start: () => runAll("start"),
    pause: () => runAll("pause"),
    stop: () => runAll("stop"),
    updateConfig,
  };
}
