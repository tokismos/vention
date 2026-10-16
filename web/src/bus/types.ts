import type { ServerState } from "@shared";
import type { Connection } from "@/types";

export type FeedSnapshot = {
  connection: Connection;
  ids: number[];
  pendulums: ServerState[];
  offlineIds: number[];
};

export type Feed = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => FeedSnapshot;
};
