import type { ReservationStatus } from "./reservation-status";
import type { Seat } from "./seat";

export class Reservation {
  readonly id: string;
  readonly showtimeId: string;
  readonly seat: Seat;
  readonly customerEmail: string;
  readonly status: ReservationStatus;

  constructor(
    id: string,
    showtimeId: string,
    seat: Seat,
    customerEmail: string,
    status: ReservationStatus,
  ) {
    this.id = id;
    this.showtimeId = showtimeId;
    this.seat = seat;
    this.customerEmail = customerEmail;
    this.status = status;
  }
}