import type { ServerState } from "@shared";

const BAR_LENGTH = 10;
const MAX_LENGTH = 3;
const MAX_MASS = 5;
const MAX_BALL_RADIUS = 0.3;
const PADDING = 0.2;
const TOP_SPACE = 0.3;
const BAR_HEIGHT = 0.15;
const ANCHOR_Y = TOP_SPACE + BAR_HEIGHT;
const REACH = MAX_LENGTH + MAX_BALL_RADIUS + PADDING;
const VIEW_BOX = [-REACH, 0, BAR_LENGTH + 2 * REACH, ANCHOR_Y + REACH].join(" ");

function ballRadius(mass: number): number {
  return MAX_BALL_RADIUS * Math.cbrt(mass / MAX_MASS);
}

type Props = {
  pendulums: ServerState[];
};

export function PendulumScene({ pendulums }: Props) {
  return (
    <svg viewBox={VIEW_BOX} className="w-full">
      <rect x={0} y={TOP_SPACE} width={BAR_LENGTH} height={BAR_HEIGHT} fill="gray" />
      {pendulums.map(({ id, angle, config }) => {
        const x = config.anchorX + config.length * Math.sin(angle);
        const y = ANCHOR_Y + config.length * Math.cos(angle);

        return (
          <g key={id}>
            <line
              x1={config.anchorX}
              y1={ANCHOR_Y}
              x2={x}
              y2={y}
              stroke="black"
              vectorEffect="non-scaling-stroke"
            />
            <circle cx={x} cy={y} r={ballRadius(config.mass)} fill="orange" />
          </g>
        );
      })}
    </svg>
  );
}
