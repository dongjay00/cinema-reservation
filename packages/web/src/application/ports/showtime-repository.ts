import type { Showtime } from "../../domain/showtime";
import type { Seat } from "../../domain/seat";

export type SeatAvailability = {
  seat: Seat;
  available: boolean;
};

export interface ShowtimeRepository {
  listShowtimes(): Promise<Showtime[]>;
  listSeats(showtimeId: string): Promise<SeatAvailability[]>;
}