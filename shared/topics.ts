export const EVERY_PRESENCE = "pendulum/+/presence";
export const EVERY_STATE = "pendulum/+/state";

export type PendulumTopic = {
  id: number;
  kind: "presence" | "state";
};

export function presenceTopic(pendulumId: number): string {
  return `pendulum/${pendulumId}/presence`;
}

export function stateTopic(pendulumId: number): string {
  return `pendulum/${pendulumId}/state`;
}

export function parsePendulumTopic(topic: string): PendulumTopic | null {
  const [root, id, kind] = topic.split("/");
  if (root !== "pendulum" || (kind !== "presence" && kind !== "state")) return null;
  return { id: Number(id), kind };
}
