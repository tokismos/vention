import { queryOptions } from "@tanstack/react-query";
import { fetchState } from "@/api";

const POLL_MS = 50;

export function stateQuery(id: number) {
  return queryOptions({
    queryKey: ["state", id],
    queryFn: () => fetchState(id),
    refetchInterval: POLL_MS,
    retry: false,
  });
}
