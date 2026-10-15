import { usePendulums, useSimulation } from "@/hooks";
import { Controls, ConfigPanel, ConnectionBadge, PendulumScene, StatusBadge } from "@/components";

const FIRST_PENDULUM_ID = 1;

export default function App() {
  const { config, connection, error, status, isLoading, start, pause, stop, updateConfig } =
    useSimulation(FIRST_PENDULUM_ID);
  const { pendulums } = usePendulums();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-72 flex-col gap-6 border-r p-6">
        <h1 className="text-xl font-bold">Pendulum simulation</h1>
        <ConnectionBadge connection={connection} />
        <StatusBadge status={status} />
        <Controls status={status} onStart={start} onPause={pause} onStop={stop} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {config && (
          <ConfigPanel config={config} disabled={status !== "stopped"} onChange={updateConfig} />
        )}
      </aside>
      <main className="flex-1 p-6">
        {isLoading && <p>Loading…</p>}
        <PendulumScene pendulums={pendulums} />
      </main>
    </div>
  );
}
