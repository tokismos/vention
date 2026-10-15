const BUTTON = "rounded border px-3 py-1 aria-pressed:bg-orange-500 aria-pressed:text-white";

type Props = {
  ids: number[];
  selectedId: number;
  onSelect: (id: number) => void;
};

export function PendulumPicker({ ids, selectedId, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {ids.map((id) => (
        <button
          key={id}
          className={BUTTON}
          aria-label={`Pendulum ${id}`}
          aria-pressed={id === selectedId}
          onClick={() => onSelect(id)}
        >
          {id}
        </button>
      ))}
    </div>
  );
}
