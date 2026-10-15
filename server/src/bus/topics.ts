export function presenceTopic(pendulumId: number): string {
  return `pendulum/${pendulumId}/presence`;
}

export function stateTopic(pendulumId: number): string {
  return `pendulum/${pendulumId}/state`;
}
