import { Reservation } from "../../domain/reservation";
import { Seat } from "../../domain/seat";

export interface ReservationRepository {
  findActiveByShowtimeAndSeat(showtimeId: string, seat: Seat): Promise<Reservation | undefined>;
  findActiveSeatsByShowtime(showtimeId: string): Promise<Seat[]>;
  findById(id: string): Promise<Reservation | undefined>;
  save(reservation: Reservation): Promise<void>;
}