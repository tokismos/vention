import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import type { ServerState, Status } from "@shared";
import { pendulumIds, sendCommand, type Command } from "@/api";
import { stateQuery } from "./stateQuery";

function overallStatus(pendulums: ServerState[]): Status {
  if (pendulums.some(({ status }) => status === "running")) return "running";
  if (pendulums.some(({ status }) => status === "paused")) return "paused";
  return "stopped";
}

function unreachableMessage(ids: number[]): string {
  return `Could not reach ${ids.length === 1 ? "pendulum" : "pendulums"} ${ids.join(", ")}`;
}

export function usePendulums() {
  const queryClient = useQueryClient();
  const ids = pendulumIds();
  const results = useQueries({ queries: ids.map((id) => stateQuery(id)) });
  const pendulums = results.flatMap(({ data, isError }) => (data && !isError ? [data] : []));
  const offlineIds = ids.filter(
    (_, index) => !results[index].isSuccess && results[index].errorUpdateCount > 0,
  );

  const { mutate: runAll, error: commandError } = useMutation({
    mutationFn: async (command: Command) => {
      const answers = await Promise.allSettled(ids.map((id) => sendCommand({ id, command })));
      const failedIds = ids.filter((_, index) => answers[index].status === "rejected");

      for (const answer of answers) {
        if (answer.status === "fulfilled") {
          queryClient.setQueryData(stateQuery(answer.value.id).queryKey, answer.value);
        }
      }
      if (failedIds.length > 0) throw new Error(unreachableMessage(failedIds));
    },
  });

  return {
    ids,
    pendulums,
    offlineIds,
    status: overallStatus(pendulums),
    commandError: commandError?.message ?? null,
    start: () => runAll("start"),
    pause: () => runAll("pause"),
    stop: () => runAll("stop"),
  };
}
