import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import type { ServerState, Status } from "@shared";
import { pendulumIds, sendCommand, type Command } from "@/api";
import { stateQuery } from "./stateQuery";

function overallStatus(pendulums: ServerState[]): Status {
  if (pendulums.some(({ status }) => status === "running")) return "running";
  if (pendulums.some(({ status }) => status === "paused")) return "paused";
  return "stopped";
}

export function usePendulums() {
  const queryClient = useQueryClient();
  const ids = pendulumIds();
  const results = useQueries({ queries: ids.map((id) => stateQuery(id)) });
  const pendulums = results.flatMap(({ data }) => (data ? [data] : []));

  const { mutate: runAll, error: commandError } = useMutation({
    mutationFn: (command: Command) => Promise.all(ids.map((id) => sendCommand({ id, command }))),
    onSuccess: (states) =>
      states.forEach((state) => queryClient.setQueryData(stateQuery(state.id).queryKey, state)),
  });

  return {
    pendulums,
    status: overallStatus(pendulums),
    commandError: commandError?.message ?? null,
    start: () => runAll("start"),
    pause: () => runAll("pause"),
    stop: () => runAll("stop"),
  };
}
