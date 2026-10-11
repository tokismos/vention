import { useEffect, useState } from "react";
import { step, type PendulumState } from "./physics";

const LENGTH = 2;
const DT = 1 / 60;
const SCALE = 200;

export default function App() {
  const [state, setState] = useState<PendulumState>({ angle: 0.5, velocity: 0 });

  useEffect(() => {
    const id = setInterval(() => {
      setState((s) => step(s, LENGTH, DT));
    }, DT * 1000);
    return () => clearInterval(id);
  }, []);

  const x = 250 + SCALE * LENGTH * Math.sin(state.angle);
  const y = 50 + SCALE * LENGTH * Math.cos(state.angle);

  return (
    <svg width={1000} height={800}>
      <line x1={250} y1={50} x2={x} y2={y} stroke="gray" />
      <circle cx={x} cy={y} r={15} fill="tomato" />
    </svg>
  );
}
