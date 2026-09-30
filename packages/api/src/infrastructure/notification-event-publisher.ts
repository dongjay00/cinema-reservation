import type { EventPublisher } from "../application/ports/event-publisher";
import {
  type DomainEvent,
  ReservationCancelled,
  ReservationCreated,
} from "../domain/events";

export class NotificationEventPublisher implements EventPublisher {
  async publish(events: readonly DomainEvent[]): Promise<void> {
    for (const event of events) {
      if (event instanceof ReservationCreated) {
        console.info(
          `[알림] ${event.customerEmail} 님, 좌석 ${event.seat.label} 예약이 확정되었습니다`,
        );
      } else if (event instanceof ReservationCancelled) {
        console.info(
          `[알림] ${event.customerEmail} 님, 예약 ${event.reservationId} 이(가) 취소되었습니다`,
        );
      }
    }
  }
}

export class SilentEventPublisher implements EventPublisher {
  async publish(_events: readonly DomainEvent[]): Promise<void> {}
}
