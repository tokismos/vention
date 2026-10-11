import { useSimulation } from "./hooks";
import { Controls, ConfigPanel, PendulumView } from "./components";

export default function App() {
  const sim = useSimulation();

  return (
    <div>
      <Controls status={sim.status} onStart={sim.start} onPause={sim.pause} onStop={sim.stop} />
      <ConfigPanel config={sim.config} disabled={sim.status !== "stopped"} onChange={sim.updateConfig} />
      <PendulumView angle={sim.state.angle} length={sim.config.length} mass={sim.config.mass} />
    </div>
  );
}
