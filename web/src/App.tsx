import { useSimulation } from "@/hooks";
import { Controls, ConfigPanel, PendulumView, StatusBadge } from "@/components";

export default function App() {
  const { config, state, status, start, pause, stop, updateConfig } = useSimulation();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-72 flex-col gap-6 border-r p-6">
        <h1 className="text-xl font-bold">Pendulum simulation</h1>
        <StatusBadge status={status} />
        <Controls status={status} onStart={start} onPause={pause} onStop={stop} />
        <ConfigPanel config={config} disabled={status !== "stopped"} onChange={updateConfig} />
      </aside>
      <main className="flex-1 p-6">
        {state && <PendulumView angle={state.angle} length={config.length} mass={config.mass} />}
      </main>
    </div>
  );
}
