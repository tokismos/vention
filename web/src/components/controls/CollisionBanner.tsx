import { useEffect, useState } from "react";
import type { Collision } from "@shared";
import { RESTART_DELAY_MS } from "@shared";

type Props = {
  collision: Collision;
};

export function CollisionBanner({ collision }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(RESTART_DELAY_MS / 1000);

  useEffect(() => {
    const timer = setInterval(() => setSecondsLeft((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  const [first, second] = collision;

  return (
    <p className="rounded border border-amber-500 bg-amber-50 p-2 text-sm text-amber-900">
      Pendulums {first} and {second} collided. Restarting in {secondsLeft} s.
    </p>
  );
}
