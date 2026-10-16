import type { LiveState } from "@shared";
import type { Connection } from "@/types";
import { overallStatus } from "./overallStatus";
import type { FeedSnapshot } from "./types";

export function toSnapshot({
  connection,
  alive,
  states,
}: LiveState & { connection: Connection }): FeedSnapshot {
  const ids = [...states.keys()].sort((a, b) => a - b);
  const pendulums = ids.filter((id) => alive.has(id)).map((id) => states.get(id)!);
  return {
    connection,
    ids,
    pendulums,
    offlineIds: ids.filter((id) => !alive.has(id)),
    status: overallStatus(pendulums),
  };
}
