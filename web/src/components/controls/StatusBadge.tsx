import type { Status } from "@/hooks";

type Props = {
  status: Status;
};

export function StatusBadge({ status }: Props) {
  return <p>Status: {status}</p>;
}
