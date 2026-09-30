import type { DomainEvent } from "../../domain/events";

export interface EventPublisher {
  publish(events: readonly DomainEvent[]): Promise<void>;
}
