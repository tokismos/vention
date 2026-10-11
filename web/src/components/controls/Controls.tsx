import type { Status } from "@/hooks";

type Props = {
  status: Status;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
};

export function Controls({ status, onStart, onPause, onStop }: Props) {
  return (
    <div>
      <button onClick={onStart}>Start</button>
      <button onClick={onPause}>Pause</button>
      <button onClick={onStop}>Stop</button>
      <span> {status}</span>
    </div>
  );
}
