import type { Showtime } from "../domain/showtime";

interface ShowtimeSelectorProps {
  showtimes: Showtime[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function ShowtimeSelector({ showtimes, selectedId, onSelect }: ShowtimeSelectorProps) {
  return (
    <select value={selectedId} onChange={(e) => onSelect(e.target.value)}>
      {showtimes.map((s) => (
        <option key={s.id} value={s.id}>
          {s.movieTitle} (
          {s.startsAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})
        </option>
      ))}
    </select>
  );
}