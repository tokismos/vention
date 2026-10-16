import type { ServerState, Status } from "@shared";
import type { Connection } from "@/types";

export type FeedSnapshot = {
  connection: Connection;
  ids: number[];
  pendulums: ServerState[];
  offlineIds: number[];
  status: Status;
};

export type Feed = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => FeedSnapshot;
};
