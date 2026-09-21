export class DuplicateReservationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DuplicateReservationError";
  }
}

export class ReservationNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReservationNotFoundError";
  }
}