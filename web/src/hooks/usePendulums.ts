import { useQueries } from "@tanstack/react-query";
import { pendulumIds } from "@/api";
import { stateQuery } from "./stateQuery";

export function usePendulums() {
  const results = useQueries({ queries: pendulumIds().map((id) => stateQuery(id)) });

  return { pendulums: results.flatMap(({ data }) => (data ? [data] : [])) };
}
