import type { Cache } from "../application/ports/cache";
import type { EventPublisher } from "../application/ports/event-publisher";
import {
  type DomainEvent,
  ReservationCancelled,
  ReservationCreated,
} from "../domain/events";
import { showtimeSeatsCacheKey } from "./caching-showtime-seats-query";

export class InvalidatingEventPublisher implements EventPublisher {
  constructor(
    private readonly delegate: EventPublisher,
    private readonly cache: Cache,
  ) {}

  async publish(events: readonly DomainEvent[]): Promise<void> {
    for (const event of events) {
      const showtimeId = showtimeIdOf(event);
      if (showtimeId) {
        try {
          await this.cache.delete(showtimeSeatsCacheKey(showtimeId));
        } catch {
          // 캐시 무효화 실패는 쓰기 경로를 막지 않는다 (fail-open).
        }
      }
    }
    await this.delegate.publish(events);
  }
}

function showtimeIdOf(event: DomainEvent): string | undefined {
  if (event instanceof ReservationCreated) {
    return event.showtimeId;
  }
  if (event instanceof ReservationCancelled) {
    return event.showtimeId;
  }
  return undefined;
}
