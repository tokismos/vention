const BUTTON =
  "rounded border px-3 py-1 aria-pressed:bg-orange-500 aria-pressed:text-white disabled:opacity-40";

type Props = {
  ids: number[];
  offlineIds: number[];
  selectedId: number;
  onSelect: (id: number) => void;
};

export function PendulumPicker({ ids, offlineIds, selectedId, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {ids.map((id) => {
        const isOffline = offlineIds.includes(id);

        return (
          <button
            key={id}
            className={BUTTON}
            aria-label={isOffline ? `Pendulum ${id} (offline)` : `Pendulum ${id}`}
            aria-pressed={id === selectedId}
            disabled={isOffline}
            onClick={() => onSelect(id)}
          >
            {id}
          </button>
        );
      })}
    </div>
  );
}
