import { applyMessage, createLiveState, EVERY_PRESENCE, EVERY_STATE } from "@shared";
import mqtt from "mqtt";
import type { Connection } from "@/types";
import { brokerUrl } from "./brokerUrl";
import { toSnapshot } from "./snapshot";
import type { Feed } from "./types";

function createFeed(): Feed {
  const live = createLiveState();
  const listeners = new Set<() => void>();
  let connection: Connection = "connecting";
  let snapshot = toSnapshot({ connection, ...live });
  let waiting = false;

  function changed() {
    if (waiting) return;
    waiting = true;
    requestAnimationFrame(() => {
      waiting = false;
      snapshot = toSnapshot({ connection, ...live });
      listeners.forEach((listener) => listener());
    });
  }

  const client = mqtt.connect(brokerUrl());

  client.on("connect", () => {
    live.alive.clear();
    live.states.clear();
    client.subscribe([EVERY_PRESENCE, EVERY_STATE]);
    connection = "online";
    changed();
  });

  client.on("offline", () => {
    connection = "offline";
    changed();
  });

  client.on("message", (topic, payload) => {
    applyMessage({ ...live, topic, text: payload.toString() });
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
