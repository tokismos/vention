import { parsePendulumTopic } from "./topics";
import type { LiveState, PendulumMessage } from "./types";

export function createLiveState(): LiveState {
  return { alive: new Set(), states: new Map() };
}

export function applyMessage({ alive, states, topic, text }: LiveState & PendulumMessage) {
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
