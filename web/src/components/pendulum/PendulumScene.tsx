import { LIMITS, MAX_BALL_RADIUS } from "@shared";
import type { ServerState } from "@shared";

const BAR_START = LIMITS.anchorX.min;
const BAR_LENGTH = LIMITS.anchorX.max - LIMITS.anchorX.min;
const PADDING = 0.2;
const TOP_SPACE = 0.3;
const BAR_HEIGHT = 0.15;
const ANCHOR_Y = TOP_SPACE + BAR_HEIGHT;
const REACH = LIMITS.length.max + MAX_BALL_RADIUS + PADDING;
const VIEW_BOX = [BAR_START - REACH, 0, BAR_LENGTH + 2 * REACH, ANCHOR_Y + REACH].join(" ");

type Props = {
  pendulums: ServerState[];
  selectedId: number;
};

export function PendulumScene({ pendulums, selectedId }: Props) {
  return (
    <svg viewBox={VIEW_BOX} className="w-full">
      <rect x={BAR_START} y={TOP_SPACE} width={BAR_LENGTH} height={BAR_HEIGHT} fill="gray" />
      {pendulums.map(({ id, config, ball }) => (
        <g key={id}>
          <line
            x1={config.anchorX}
            y1={ANCHOR_Y}
            x2={ball.x}
            y2={ANCHOR_Y + ball.y}
            stroke="black"
            vectorEffect="non-scaling-stroke"
          />
          <circle
            cx={ball.x}
            cy={ANCHOR_Y + ball.y}
            r={ball.radius}
            fill={id === selectedId ? "orangered" : "orange"}
          />
        </g>
      ))}
    </svg>
  );
}
