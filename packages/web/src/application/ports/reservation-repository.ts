import type { Reservation } from "../../domain/reservation";
import type { Seat } from "../../domain/seat";

export interface CreateReservationParams {
  showtimeId: string;
  seat: Seat;
  customerEmail: string;
}

export interface ReservationRepository {
  create(params: CreateReservationParams): Promise<Reservation>;
  cancel(id: string): Promise<Reservation>;
}