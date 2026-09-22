import type { Seat } from "../../domain/seat";
import type { Showtime } from "../../domain/showtime";

export type SeatAvailability = {
  seat: Seat;
  available: boolean;
};

export interface ShowtimeRepository {
  listShowtimes(): Promise<Showtime[]>;
  listSeats(showtimeId: string): Promise<SeatAvailability[]>;
}
