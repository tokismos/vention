import type { Collision, ServerState, Status } from "@shared";
import type { Connection } from "@/types";

export type FeedSnapshot = {
  connection: Connection;
  ids: number[];
  pendulums: ServerState[];
  offlineIds: number[];
  status: Status;
  collision: Collision | null;
};

export type Feed = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => FeedSnapshot;
};
