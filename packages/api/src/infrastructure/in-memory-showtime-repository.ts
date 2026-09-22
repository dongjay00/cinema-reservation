import type { ShowtimeRepository } from "../application/ports/showtime-repository";
import { Movie } from "../domain/movie";
import { Seat } from "../domain/seat";
import { Showtime } from "../domain/showtime";

const LAYOUT = [
  { row: "A", numbers: [1, 2, 3, 4, 5, 6, 7, 8] },
  { row: "B", numbers: [1, 2, 3, 4, 5, 6, 7, 8] },
  { row: "C", numbers: [1, 2, 3, 4, 5, 6, 7, 8] },
];

const showtimes: Showtime[] = [
  new Showtime(new Movie("인셉션", 148), new Date("2026-09-20T10:00:00")),
  new Showtime(new Movie("인터스텔라", 169), new Date("2026-09-20T14:00:00")),
];

export class InMemoryShowtimeRepository implements ShowtimeRepository {
  async findAll(): Promise<Showtime[]> {
    return showtimes;
  }

  async findById(id: string): Promise<Showtime | undefined> {
    return showtimes.find((s) => s.id === id);
  }

  async listSeats(): Promise<Seat[]> {
    return LAYOUT.flatMap(({ row, numbers }) =>
      numbers.map((number) => new Seat(row, number)),
    );
  }
}
