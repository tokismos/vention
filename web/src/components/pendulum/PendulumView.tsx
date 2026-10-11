const WIDTH = 1000;
const HEIGHT = 600;
const SCALE = 160;
const ANCHOR_X = WIDTH / 2;
const ANCHOR_Y = 60;

type Props = {
  angle: number;
  length: number;
  mass: number;
};

export function PendulumView({ angle, length, mass }: Props) {
  const x = ANCHOR_X + SCALE * length * Math.sin(angle);
  const y = ANCHOR_Y + SCALE * length * Math.cos(angle);

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full">
      <rect x={80} y={40} width={840} height={20} fill="gray" />
      <line x1={ANCHOR_X} y1={ANCHOR_Y} x2={x} y2={y} stroke="black" />
      <circle cx={x} cy={y} r={10 + mass * 5} fill="orange" />
    </svg>
  );
}
