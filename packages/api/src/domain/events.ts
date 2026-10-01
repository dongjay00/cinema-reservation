import type { Seat } from "./seat";

export interface DomainEvent {
  readonly occurredAt: Date;
}

export class ReservationCreated implements DomainEvent {
  constructor(
    readonly reservationId: string,
    readonly showtimeId: string,
    readonly seat: Seat,
    readonly customerEmail: string,
    readonly occurredAt: Date = new Date(),
  ) {}
}

export class ReservationCancelled implements DomainEvent {
  constructor(
    readonly reservationId: string,
    readonly showtimeId: string,
    readonly customerEmail: string,
    readonly occurredAt: Date = new Date(),
  ) {}
}
