import type { Reservation } from "../../domain/reservation";
import type { Seat } from "../../domain/seat";

export interface CreateReservationRepository {
  findActiveByShowtimeAndSeat(
    showtimeId: string,
    seat: Seat,
  ): Promise<Reservation | undefined>;
  save(reservation: Reservation): Promise<void>;
}

export interface CancelReservationRepository {
  findById(id: string): Promise<Reservation | undefined>;
  save(reservation: Reservation): Promise<void>;
}

export interface ShowtimeSeatsQuery {
  findActiveSeatsByShowtime(showtimeId: string): Promise<Seat[]>;
}

export interface ReservationsByCustomerQuery {
  findByCustomerEmail(email: string): Promise<Reservation[]>;
}

export type ReservationRepository = CreateReservationRepository &
  CancelReservationRepository &
  ShowtimeSeatsQuery &
  ReservationsByCustomerQuery;
