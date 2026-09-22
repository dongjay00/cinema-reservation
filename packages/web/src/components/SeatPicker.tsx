import type { CSSProperties } from "react";
import { Seat } from "../domain/seat";
import type { SeatAvailability } from "../application/ports/showtime-repository";

interface SeatPickerProps {
  seats: SeatAvailability[];
  selected: Seat | undefined;
  onSelect: (seat: Seat) => void;
}

export function SeatPicker({ seats, selected, onSelect }: SeatPickerProps) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, margin: "12px 0" }}>
      {seats.map(({ seat, available }) => {
        const isSelected = selected?.equals(seat) ?? false;
        return (
          <button
            key={seat.label}
            disabled={!available && !isSelected}
            onClick={() => onSelect(seat)}
            style={styleFor(isSelected, available)}
          >
            {seat.label}
          </button>
        );
      })}
    </div>
  );
}

function styleFor(isSelected: boolean, available: boolean): CSSProperties {
  if (isSelected) {
    return { background: "steelblue", color: "white" };
  }
  if (!available) {
    return { background: "#eee", color: "#aaa", cursor: "not-allowed" };
  }
  return {};
}