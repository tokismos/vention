import { useMutation, useQuery, useQueryClient, type QueryStatus } from "@tanstack/react-query";
import type { ServerState } from "@shared";
import { fetchState, sendCommand, sendConfig } from "@/api";
import type { Connection } from "@/types";

const POLL_MS = 50;
const STATE_KEY = ["state"];

const CONNECTION: Record<QueryStatus, Connection> = {
  pending: "connecting",
  error: "offline",
  success: "online",
};

export function useSimulation() {
  const queryClient = useQueryClient();
  const saveState = (state: ServerState) => queryClient.setQueryData(STATE_KEY, state);

  const { data: state, status: queryStatus } = useQuery({
    queryKey: STATE_KEY,
    queryFn: fetchState,
    refetchInterval: POLL_MS,
    retry: false,
  });

  const { mutate: run, error: commandError } = useMutation({
    mutationFn: sendCommand,
    onSuccess: saveState,
  });

  const { mutate: updateConfig, error: configError } = useMutation({
    mutationFn: sendConfig,
    onSuccess: saveState,
  });

  return {
    state,
    connection: CONNECTION[queryStatus],
    error: (commandError ?? configError)?.message ?? null,
    status: state?.status ?? "stopped",
    isLoading: queryStatus === "pending",
    start: () => run("start"),
    pause: () => run("pause"),
    stop: () => run("stop"),
    updateConfig,
  };
}
