export const RESTART_DELAY_MS = 5000;

export type RestartBarrierOptions = {
  alive: Set<number>;
  restart: () => void;
};

export function createRestartBarrier({ alive, restart }: RestartBarrierOptions) {
  const ready = new Set<number>();
  let timer: NodeJS.Timeout | undefined;

  function restartHeard(pendulumId: number) {
    ready.add(pendulumId);
    if (timer || ![...alive].every((id) => ready.has(id))) return;
    timer = setTimeout(finish, RESTART_DELAY_MS);
  }

  function finish() {
    timer = undefined;
    ready.clear();
    restart();
  }

  return { restartHeard };
}
