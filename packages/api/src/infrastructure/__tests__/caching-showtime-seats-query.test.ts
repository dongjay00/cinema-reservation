import { describe, expect, it } from "vitest";
import type { ShowtimeSeatsQuery } from "../../application/ports/reservation-repository";
import { Seat } from "../../domain/seat";
import { CachingShowtimeSeatsQuery } from "../caching-showtime-seats-query";
import { InMemoryCache } from "../in-memory-cache";

class SpySeatsQuery implements ShowtimeSeatsQuery {
  calls = 0;

  async findActiveSeatsByShowtime(_showtimeId: string): Promise<Seat[]> {
    this.calls += 1;
    return [new Seat("A", 1)];
  }
}

describe("CachingShowtimeSeatsQuery", () => {
  it("첫 조회는 위임 포트에서, TTL 내 재조회는 캐시에서 반환한다 (AC-37)", async () => {
    const delegate = new SpySeatsQuery();
    const query = new CachingShowtimeSeatsQuery(
      delegate,
      new InMemoryCache(() => 1_000),
      5_000,
    );

    const first = await query.findActiveSeatsByShowtime("showtime-1");
    const second = await query.findActiveSeatsByShowtime("showtime-1");

    expect(delegate.calls).toBe(1);
    expect(first).toEqual([new Seat("A", 1)]);
    expect(second).toEqual(first);
  });

  it("TTL이 만료되면 다시 위임 포트에서 조회한다 (AC-38)", async () => {
    let now = 1_000;
    const delegate = new SpySeatsQuery();
    const query = new CachingShowtimeSeatsQuery(
      delegate,
      new InMemoryCache(() => now),
      5_000,
    );

    await query.findActiveSeatsByShowtime("showtime-1");
    now = 6_001;
    await query.findActiveSeatsByShowtime("showtime-1");

    expect(delegate.calls).toBe(2);
  });

  it("showtime별로 캐시 키가 분리된다 (AC-39)", async () => {
    const delegate = new SpySeatsQuery();
    const query = new CachingShowtimeSeatsQuery(
      delegate,
      new InMemoryCache(() => 1_000),
      5_000,
    );

    await query.findActiveSeatsByShowtime("showtime-1");
    await query.findActiveSeatsByShowtime("showtime-2");

    expect(delegate.calls).toBe(2);
  });
});
