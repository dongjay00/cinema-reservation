import type { Reservation } from "../../domain/reservation";
import type { Seat } from "../../domain/seat";

export interface CreateReservationParams {
  showtimeId: string;
  seat: Seat;
  customerEmail: string;
}

export interface ReservationCreator {
  create(params: CreateReservationParams): Promise<Reservation>;
}

export interface ReservationCanceller {
  cancel(id: string): Promise<Reservation>;
}

export type ReservationRepository = ReservationCreator & ReservationCanceller;
