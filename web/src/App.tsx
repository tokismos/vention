import { useSimulation } from "@/hooks";
import { Controls, ConfigPanel, PendulumView, StatusBadge } from "@/components";

export default function App() {
  const { state, status, start, pause, stop, updateConfig } = useSimulation();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-72 flex-col gap-6 border-r p-6">
        <h1 className="text-xl font-bold">Pendulum simulation</h1>
        <StatusBadge status={status} />
        <Controls status={status} onStart={start} onPause={pause} onStop={stop} />
        {state && (
          <ConfigPanel config={state.config} disabled={status !== "stopped"} onChange={updateConfig} />
        )}
      </aside>
      <main className="flex-1 p-6">
        {state && (
          <PendulumView angle={state.angle} length={state.config.length} mass={state.config.mass} />
        )}
      </main>
    </div>
  );
}
