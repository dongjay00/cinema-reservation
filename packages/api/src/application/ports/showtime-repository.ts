import { Showtime } from "../../domain/showtime";
import { Seat } from "../../domain/seat";

export interface ShowtimeRepository {
  findAll(): Promise<Showtime[]>;
  findById(id: string): Promise<Showtime | undefined>;
  listSeats(): Promise<Seat[]>;
}