import type { PendulumConfig } from "../../domain/config";
import { Slider } from "./Slider";

type Props = {
  config: PendulumConfig;
  disabled: boolean;
  onChange: (change: Partial<PendulumConfig>) => void;
};

export function ConfigPanel({ config, disabled, onChange }: Props) {
  return (
    <div>
      <Slider label="Angle (°)" value={config.angleDeg} min={-90} max={90} step={1}
        disabled={disabled} onChange={(v) => onChange({ angleDeg: v })} />
      <Slider label="Length (m)" value={config.length} min={0.5} max={3} step={0.1}
        disabled={disabled} onChange={(v) => onChange({ length: v })} />
      <Slider label="Mass (kg)" value={config.mass} min={0.5} max={5} step={0.5}
        disabled={disabled} onChange={(v) => onChange({ mass: v })} />
    </div>
  );
}
