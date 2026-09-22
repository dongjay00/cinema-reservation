import { randomUUID } from "node:crypto";
import type { ReservationStatus } from "./reservation-status";
import type { Seat } from "./seat";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Reservation {
  readonly id: string;
  readonly showtimeId: string;
  readonly seat: Seat;
  readonly customerEmail: string;
  private _status: ReservationStatus;

  constructor(
    showtimeId: string,
    seat: Seat,
    customerEmail: string,
    id: string = randomUUID(),
    status: ReservationStatus = "CONFIRMED",
  ) {
    if (showtimeId.trim().length === 0) {
      throw new Error("Reservation showtimeId must not be empty");
    }
    if (!EMAIL_PATTERN.test(customerEmail)) {
      throw new Error(
        "Reservation customerEmail must be a valid email address",
      );
    }

    this.id = id;
    this.showtimeId = showtimeId;
    this.seat = seat;
    this.customerEmail = customerEmail;
    this._status = status;
  }

  get status(): ReservationStatus {
    return this._status;
  }

  cancel(): void {
    if (this._status === "CANCELLED") {
      throw new Error("Cannot cancel an already cancelled reservation");
    }
    this._status = "CANCELLED";
  }
}
