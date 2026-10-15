import { useMutation, useQuery, useQueryClient, type QueryStatus } from "@tanstack/react-query";
import type { PendulumConfig, ServerState } from "@shared";
import { sendConfig } from "@/api";
import type { Connection } from "@/types";
import { stateQuery } from "./stateQuery";

const CONNECTION: Record<QueryStatus, Connection> = {
  pending: "connecting",
  error: "offline",
  success: "online",
};

export function useSimulation(id: number) {
  const queryClient = useQueryClient();
  const query = stateQuery(id);
  const saveState = (state: ServerState) => queryClient.setQueryData(query.queryKey, state);

  const { data: state, status: queryStatus, errorUpdateCount } = useQuery(query);
  const isOffline = queryStatus !== "success" && errorUpdateCount > 0;

  const { mutate: saveConfig, error: configError } = useMutation({
    mutationFn: sendConfig,
    onSuccess: saveState,
  });

  return {
    config: state?.config,
    connection: isOffline ? "offline" : CONNECTION[queryStatus],
    configError: configError?.message ?? null,
    isLocked: (state?.status ?? "stopped") !== "stopped",
    isLoading: queryStatus === "pending" && !isOffline,
    updateConfig: (change: Partial<PendulumConfig>) => saveConfig({ id, change }),
  };
}
