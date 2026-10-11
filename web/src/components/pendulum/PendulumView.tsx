const SCALE = 200;
const ANCHOR_X = 500;
const ANCHOR_Y = 50;

type Props = {
  angle: number;
  length: number;
  mass: number;
};

export function PendulumView({ angle, length, mass }: Props) {
  const x = ANCHOR_X + SCALE * length * Math.sin(angle);
  const y = ANCHOR_Y + SCALE * length * Math.cos(angle);

  return (
    <svg width={1000} height={800}>
      <line x1={ANCHOR_X} y1={ANCHOR_Y} x2={x} y2={y} stroke="gray" />
      <circle cx={x} cy={y} r={10 + mass * 5} fill="tomato" />
    </svg>
  );
}
