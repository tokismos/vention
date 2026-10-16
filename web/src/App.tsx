import { useState } from "react";
import { usePendulums } from "@/hooks";
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
  const {
    connection,
    ids,
    pendulums,
    offlineIds,
    status,
    commandError,
    configError,
    start,
    pause,
    stop,
    updateConfig,
  } = usePendulums();
  const selected = pendulums.find((pendulum) => pendulum.id === selectedId);

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-72 flex-col gap-6 border-r p-6">
        <h1 className="text-xl font-bold">Pendulum simulation</h1>
        <ConnectionBadge connection={connection} />
        <StatusBadge status={status} />
        <Controls status={status} onStart={start} onPause={pause} onStop={stop} />
        {commandError && <p className="text-sm text-red-600">{commandError}</p>}
        <PendulumPicker
          ids={ids}
          offlineIds={offlineIds}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        {offlineIds.length > 0 && (
          <p className="text-sm text-red-600">Offline: {offlineIds.join(", ")}</p>
        )}
        {configError && <p className="text-sm text-red-600">{configError}</p>}
        {selected && (
          <ConfigPanel
            config={selected.config}
            disabled={selected.status !== "stopped"}
            onChange={(change) => updateConfig({ id: selectedId, change })}
          />
        )}
      </aside>
      <main className="flex-1 p-6">
        {connection === "connecting" && <p>Loading…</p>}
        <PendulumScene pendulums={pendulums} selectedId={selectedId} />
      </main>
    </div>
  );
}
