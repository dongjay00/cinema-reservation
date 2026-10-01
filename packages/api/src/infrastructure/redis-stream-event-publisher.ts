import {
  RESERVATION_EVENT_STREAM,
  type ReservationEventDto,
} from "@cinema/shared";
import type Redis from "ioredis";
import type { EventPublisher } from "../application/ports/event-publisher";
import {
  type DomainEvent,
  ReservationCancelled,
  ReservationCreated,
} from "../domain/events";

export function toReservationEventDto(event: DomainEvent): ReservationEventDto {
  if (event instanceof ReservationCreated) {
    return {
      type: "ReservationCreated",
      reservationId: event.reservationId,
      showtimeId: event.showtimeId,
      seatRow: event.seat.row,
      seatNumber: event.seat.number,
      customerEmail: event.customerEmail,
    };
  }
  if (event instanceof ReservationCancelled) {
    return {
      type: "ReservationCancelled",
      reservationId: event.reservationId,
      customerEmail: event.customerEmail,
    };
  }
  throw new Error(`Unsupported event: ${event.constructor.name}`);
}

export class RedisStreamEventPublisher implements EventPublisher {
  constructor(private readonly redis: Redis) {}

  async publish(events: readonly DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.redis.xadd(
        RESERVATION_EVENT_STREAM,
        "*",
        "payload",
        JSON.stringify(toReservationEventDto(event)),
      );
    }
  }
}
