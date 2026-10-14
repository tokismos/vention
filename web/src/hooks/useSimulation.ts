import { useMutation, useQuery, useQueryClient, type QueryStatus } from "@tanstack/react-query";
import type { PendulumConfig, ServerState } from "@shared";
import { fetchState, sendCommand, sendConfig } from "@/api";
import type { Connection } from "@/types";

const POLL_MS = 50;

const CONNECTION: Record<QueryStatus, Connection> = {
  pending: "connecting",
  error: "offline",
  success: "online",
};

export function useSimulation(id: number) {
  const queryClient = useQueryClient();
  const stateKey = ["state", id];
  const saveState = (state: ServerState) => queryClient.setQueryData(stateKey, state);

  const { data: state, status: queryStatus } = useQuery({
    queryKey: stateKey,
    queryFn: () => fetchState(id),
    refetchInterval: POLL_MS,
    retry: false,
  });

  const { mutate: run, error: commandError } = useMutation({
    mutationFn: sendCommand,
    onSuccess: saveState,
  });

  const { mutate: saveConfig, error: configError } = useMutation({
    mutationFn: sendConfig,
    onSuccess: saveState,
  });

  return {
    state,
    config: state?.config,
    connection: CONNECTION[queryStatus],
    error: (commandError ?? configError)?.message ?? null,
    status: state?.status ?? "stopped",
    isLoading: queryStatus === "pending",
    start: () => run({ id, command: "start" }),
    pause: () => run({ id, command: "pause" }),
    stop: () => run({ id, command: "stop" }),
    updateConfig: (change: Partial<PendulumConfig>) => saveConfig({ id, change }),
  };
}
