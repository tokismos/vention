import { LIMITS } from "@shared";
import type { PendulumConfig } from "@shared";
import { Slider } from "./Slider";

type Props = {
  config: PendulumConfig;
  disabled: boolean;
  onChange: (change: Partial<PendulumConfig>) => void;
};

export function ConfigPanel({ config, disabled, onChange }: Props) {
  return (
    <section className="flex flex-col gap-4">
      <Slider
        label="Angle (°)"
        value={config.angleDeg}
        min={LIMITS.angleDeg.min}
        max={LIMITS.angleDeg.max}
        step={1}
        disabled={disabled}
        onChange={(v) => onChange({ angleDeg: v })}
      />
      <Slider
        label="Length (m)"
        value={config.length}
        min={LIMITS.length.min}
        max={LIMITS.length.max}
        step={0.1}
        disabled={disabled}
        onChange={(v) => onChange({ length: v })}
      />
      <Slider
        label="Mass (kg)"
        value={config.mass}
        min={LIMITS.mass.min}
        max={LIMITS.mass.max}
        step={0.5}
        disabled={disabled}
        onChange={(v) => onChange({ mass: v })}
      />
      <Slider
        label="Anchor X (m)"
        value={config.anchorX}
        min={LIMITS.anchorX.min}
        max={LIMITS.anchorX.max}
        step={0.1}
        disabled={disabled}
        onChange={(v) => onChange({ anchorX: v })}
      />
    </section>
  );
}
