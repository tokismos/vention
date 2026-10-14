export function pendulumIds(): number[] {
  const count = Number(import.meta.env.VITE_PENDULUM_COUNT ?? 1);
  return Array.from({ length: count }, (_, index) => index + 1);
}
