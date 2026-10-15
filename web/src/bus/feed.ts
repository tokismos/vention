import { EVERY_PRESENCE, EVERY_STATE, parsePendulumTopic } from "@shared";
import type { ServerState } from "@shared";
import mqtt from "mqtt";
import type { Connection } from "@/types";
import type { Feed, FeedSnapshot } from "./types";

const BROKER_PATH = "/mqtt";

function brokerUrl(): string {
  const protocol = location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${location.host}${BROKER_PATH}`;
}

let feed: Feed | undefined;

function createFeed(): Feed {
  const alive = new Set<number>();
  const states = new Map<number, ServerState>();
  const listeners = new Set<() => void>();
  let connection: Connection = "connecting";
  let snapshot: FeedSnapshot = { connection, ids: [], pendulums: [], offlineIds: [] };
  let waiting = false;

  function refresh() {
    waiting = false;
    const ids = [...states.keys()].sort((a, b) => a - b);
    snapshot = {
      connection,
      ids,
      pendulums: ids.filter((id) => alive.has(id)).map((id) => states.get(id)!),
      offlineIds: ids.filter((id) => !alive.has(id)),
    };
    listeners.forEach((listener) => listener());
  }

  function changed() {
    if (waiting) return;
    waiting = true;
    requestAnimationFrame(refresh);
  }

  const client = mqtt.connect(brokerUrl());

  client.on("connect", () => {
    client.subscribe([EVERY_PRESENCE, EVERY_STATE]);
    connection = "online";
    changed();
  });

  client.on("offline", () => {
    connection = "offline";
    changed();
  });

  client.on("message", (topic, payload) => {
    const parsed = parsePendulumTopic(topic);
    if (!parsed) return;
    const text = payload.toString();

    if (parsed.kind === "presence") {
      if (text) alive.add(parsed.id);
      else alive.delete(parsed.id);
    } else {
      if (text) states.set(parsed.id, JSON.parse(text));
      else states.delete(parsed.id);
    }
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

export function pendulumFeed(): Feed {
  feed ??= createFeed();
  return feed;
}
