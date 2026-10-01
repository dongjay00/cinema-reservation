import { describe, expect, it, vi } from "vitest";
import type { Cache } from "../../application/ports/cache";
import type { EventPublisher } from "../../application/ports/event-publisher";
import { ReservationCancelled, ReservationCreated } from "../../domain/events";
import { Seat } from "../../domain/seat";
import { showtimeSeatsCacheKey } from "../caching-showtime-seats-query";
import { InvalidatingEventPublisher } from "../invalidating-event-publisher";

class SpyCache implements Cache {
  deleted: string[] = [];

  async get(): Promise<undefined> {
    return undefined;
  }

  async set(): Promise<void> {}

  async delete(key: string): Promise<void> {
    this.deleted.push(key);
  }
}

class SpyPublisher implements EventPublisher {
  published: unknown[] = [];

  async publish(events: readonly unknown[]): Promise<void> {
    this.published.push(...events);
  }
}

describe("InvalidatingEventPublisher", () => {
  it("ReservationCreated 이벤트의 쇼타임 좌석 캐시를 지운다", async () => {
    const cache = new SpyCache();
    const publisher = new SpyPublisher();
    const invalidator = new InvalidatingEventPublisher(publisher, cache);

    const event = new ReservationCreated(
      "res-1",
      "showtime-1",
      new Seat("A", 1),
      "hoon@example.com",
    );
    await invalidator.publish([event]);

    expect(cache.deleted).toEqual([showtimeSeatsCacheKey("showtime-1")]);
    expect(publisher.published).toEqual([event]);
  });

  it("ReservationCancelled 이벤트의 쇼타임 좌석 캐시를 지운다", async () => {
    const cache = new SpyCache();
    const publisher = new SpyPublisher();
    const invalidator = new InvalidatingEventPublisher(publisher, cache);

    const event = new ReservationCancelled(
      "res-1",
      "showtime-1",
      "hoon@example.com",
    );
    await invalidator.publish([event]);

    expect(cache.deleted).toEqual([showtimeSeatsCacheKey("showtime-1")]);
  });

  it("캐시 삭제 실패는 발행을 막지 않는다 (fail-open)", async () => {
    const failingCache = {
      delete: vi.fn().mockRejectedValue(new Error("redis down")),
    } as unknown as Cache;
    const publisher = new SpyPublisher();
    const invalidator = new InvalidatingEventPublisher(publisher, failingCache);

    await invalidator.publish([
      new ReservationCreated(
        "res-1",
        "showtime-1",
        new Seat("A", 1),
        "hoon@example.com",
      ),
    ]);

    expect(publisher.published).toHaveLength(1);
  });
});
