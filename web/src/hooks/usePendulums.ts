import { useMutation } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import { sendCommandToAll, sendConfig, type Command } from "@/api";
import { pendulumFeed } from "@/bus";

export function usePendulums() {
  const { subscribe, getSnapshot } = pendulumFeed();
  const { connection, ids, pendulums, offlineIds, status, collision } = useSyncExternalStore(
    subscribe,
    getSnapshot,
  );
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
    status,
    collision,
    commandError: commandError?.message ?? null,
    configError: configError?.message ?? null,
    start: () => runAll("start"),
    pause: () => runAll("pause"),
    stop: () => runAll("stop"),
    updateConfig,
  };
}
