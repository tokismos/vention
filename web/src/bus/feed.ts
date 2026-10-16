import { EVERY_PRESENCE, EVERY_STATE, parsePendulumTopic } from "@shared";
import type { ServerState } from "@shared";
import mqtt from "mqtt";
import type { Connection } from "@/types";

const BROKER_PATH = "/mqtt";

type FeedSnapshot = {
  connection: Connection;
  ids: number[];
  pendulums: ServerState[];
  offlineIds: number[];
};

type Feed = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => FeedSnapshot;
};

type Memory = {
  alive: Set<number>;
  states: Map<number, ServerState>;
};

type Message = {
  topic: string;
  text: string;
};

function brokerUrl(): string {
  const protocol = location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${location.host}${BROKER_PATH}`;
}

function applyMessage({ alive, states, topic, text }: Memory & Message) {
  const parsed = parsePendulumTopic(topic);
  if (!parsed) return;

  if (parsed.kind === "presence") {
    if (text) alive.add(parsed.id);
    else alive.delete(parsed.id);
  } else {
    if (text) states.set(parsed.id, JSON.parse(text));
    else states.delete(parsed.id);
  }
}

function toSnapshot({
  connection,
  alive,
  states,
}: Memory & { connection: Connection }): FeedSnapshot {
  const ids = [...states.keys()].sort((a, b) => a - b);
  return {
    connection,
    ids,
    pendulums: ids.filter((id) => alive.has(id)).map((id) => states.get(id)!),
    offlineIds: ids.filter((id) => !alive.has(id)),
  };
}

function createFeed(): Feed {
  const memory: Memory = { alive: new Set(), states: new Map() };
  const listeners = new Set<() => void>();
  let connection: Connection = "connecting";
  let snapshot = toSnapshot({ connection, ...memory });
  let waiting = false;

  function changed() {
    if (waiting) return;
    waiting = true;
    requestAnimationFrame(() => {
      waiting = false;
      snapshot = toSnapshot({ connection, ...memory });
      listeners.forEach((listener) => listener());
    });
  }

  const client = mqtt.connect(brokerUrl());

  client.on("connect", () => {
    memory.alive.clear();
    memory.states.clear();
    client.subscribe([EVERY_PRESENCE, EVERY_STATE]);
    connection = "online";
    changed();
  });

  client.on("offline", () => {
    connection = "offline";
    changed();
  });

  client.on("message", (topic, payload) => {
    applyMessage({ ...memory, topic, text: payload.toString() });
    changed();
  });

  return {
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => snapshot,
  };
}

let feed: Feed | undefined;

export function pendulumFeed(): Feed {
  feed ??= createFeed();
  return feed;
}
