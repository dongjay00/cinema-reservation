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

export class ShowtimeNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShowtimeNotFoundError";
  }
}