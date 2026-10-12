import type { Connection } from "@/types";

const LABELS: Record<Connection, string> = {
  connecting: "Connecting…",
  online: "Server online",
  offline: "Server offline",
};

const DOT_COLORS: Record<Connection, string> = {
  connecting: "bg-gray-400",
  online: "bg-green-500",
  offline: "bg-red-500",
};

type Props = {
  connection: Connection;
};

export function ConnectionBadge({ connection }: Props) {
  return (
    <p className="flex items-center gap-2">
      <span className={`size-2 rounded-full ${DOT_COLORS[connection]}`} />
      {LABELS[connection]}
    </p>
  );
}
