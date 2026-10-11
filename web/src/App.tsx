import { useSimulation } from "@/hooks";
import { Controls, ConfigPanel, PendulumView } from "@/components";

export default function App() {
  const { config, state, status, start, pause, stop, updateConfig } = useSimulation();

  return (
    <div>
      <Controls status={status} onStart={start} onPause={pause} onStop={stop} />
      <ConfigPanel config={config} disabled={status !== "stopped"} onChange={updateConfig} />
      <PendulumView angle={state.angle} length={config.length} mass={config.mass} />
    </div>
  );
}
