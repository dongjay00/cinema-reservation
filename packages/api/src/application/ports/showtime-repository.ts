import type { Seat } from "../../domain/seat";
import type { Showtime } from "../../domain/showtime";

export interface ShowtimeRepository {
  findAll(): Promise<Showtime[]>;
  findById(id: string): Promise<Showtime | undefined>;
  listSeats(): Promise<Seat[]>;
}
