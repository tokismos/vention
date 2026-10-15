import { useState } from "react";
import { usePendulums, useSimulation } from "@/hooks";
import {
  Controls,
  ConfigPanel,
  ConnectionBadge,
  PendulumPicker,
  PendulumScene,
  StatusBadge,
} from "@/components";

const FIRST_PENDULUM_ID = 1;

export default function App() {
  const [selectedId, setSelectedId] = useState(FIRST_PENDULUM_ID);
  const { config, connection, configError, isLocked, isLoading, updateConfig } =
    useSimulation(selectedId);
  const { pendulums, status, commandError, start, pause, stop } = usePendulums();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-72 flex-col gap-6 border-r p-6">
        <h1 className="text-xl font-bold">Pendulum simulation</h1>
        <ConnectionBadge connection={connection} />
        <StatusBadge status={status} />
        <Controls status={status} onStart={start} onPause={pause} onStop={stop} />
        {commandError && <p className="text-sm text-red-600">{commandError}</p>}
        <PendulumPicker
          ids={pendulums.map(({ id }) => id)}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        {configError && <p className="text-sm text-red-600">{configError}</p>}
        {config && <ConfigPanel config={config} disabled={isLocked} onChange={updateConfig} />}
      </aside>
      <main className="flex-1 p-6">
        {isLoading && <p>Loading…</p>}
        <PendulumScene pendulums={pendulums} selectedId={selectedId} />
      </main>
    </div>
  );
}
