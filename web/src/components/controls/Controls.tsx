import type { Status } from "@/hooks";

const BUTTON = "flex-1 rounded border px-3 py-1 disabled:opacity-40";

type Props = {
  status: Status;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
};

export function Controls({ status, onStart, onPause, onStop }: Props) {
  return (
    <div className="flex gap-2">
      <button className={BUTTON} onClick={onStart} disabled={status === "running"}>
        Start
      </button>
      <button className={BUTTON} onClick={onPause} disabled={status !== "running"}>
        Pause
      </button>
      <button className={BUTTON} onClick={onStop} disabled={status === "stopped"}>
        Stop
      </button>
    </div>
  );
}
