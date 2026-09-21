import { Seat } from "../domain/seat";

const ROWS = [
  { row: "A", numbers: [1, 2, 3, 4, 5, 6, 7, 8] },
  { row: "B", numbers: [1, 2, 3, 4, 5, 6, 7, 8] },
  { row: "C", numbers: [1, 2, 3, 4, 5, 6, 7, 8] },
];

interface SeatPickerProps {
  selected: Seat | undefined;
  onSelect: (seat: Seat) => void;
}

export function SeatPicker({ selected, onSelect }: SeatPickerProps) {
  return (
    <div>
      {ROWS.map(({ row, numbers }) => (
        <div key={row}>
          {numbers.map((number) => {
            const seat = new Seat(row, number);
            const isSelected = selected?.equals(seat) ?? false;
            return (
              <button
                key={seat.label}
                onClick={() => onSelect(seat)}
                style={isSelected ? { background: "steelblue", color: "white" } : undefined}
              >
                {seat.label}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}