import type { Status } from "@shared";

type Props = {
  status: Status;
};

export function StatusBadge({ status }: Props) {
  return <p>Status: {status}</p>;
}
