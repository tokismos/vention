import type { LiveState } from "@shared";
import type { Connection } from "@/types";
import type { FeedSnapshot } from "./types";

export function toSnapshot({
  connection,
  alive,
  states,
}: LiveState & { connection: Connection }): FeedSnapshot {
  const ids = [...states.keys()].sort((a, b) => a - b);
  return {
    connection,
    ids,
    pendulums: ids.filter((id) => alive.has(id)).map((id) => states.get(id)!),
    offlineIds: ids.filter((id) => !alive.has(id)),
  };
}
