import Redis from "ioredis";
import { afterAll, describe, expect, it } from "vitest";
import type { ShowtimeSeatsQuery } from "../../application/ports/reservation-repository";
import { Seat } from "../../domain/seat";
import { CachingShowtimeSeatsQuery } from "../caching-showtime-seats-query";
import { RedisCache } from "../redis-cache";

const redisUrl = process.env.REDIS_URL;

describe.skipIf(!redisUrl)("RedisCache", () => {
  const redis = new Redis(redisUrl as string);

  afterAll(async () => {
    await redis.quit();
  });

  it("없는 키는 undefined를 반환한다", async () => {
    const cache = new RedisCache(redis);
    await expect(cache.get("zz-missing")).resolves.toBeUndefined();
  });

  it("객체를 JSON 왕복으로 set/get한다", async () => {
    const cache = new RedisCache(redis);
    await cache.set("zz-roundtrip", { row: "A", number: 1 }, 60_000);
    await expect(cache.get("zz-roundtrip")).resolves.toEqual({
      row: "A",
      number: 1,
    });
  });

  it("TTL(ms)이 지나면 만료된다", async () => {
    const cache = new RedisCache(redis);
    const key = `zz-expire-${Date.now()}`;
    await cache.set(key, "v", 500);
    expect(await cache.get(key)).toBe("v");
    await new Promise((resolve) => setTimeout(resolve, 600));
    await expect(cache.get(key)).resolves.toBeUndefined();
  });

  it("delete하면 즉시 사라진다", async () => {
    const cache = new RedisCache(redis);
    const key = `zz-delete-${Date.now()}`;
    await cache.set(key, "v", 60_000);
    await cache.delete(key);
    await expect(cache.get(key)).resolves.toBeUndefined();
  });

  it("decorator가 Redis 캐시로 좌석을 Seat로 재구성한다 (AC-42)", async () => {
    class Spy implements ShowtimeSeatsQuery {
      calls = 0;
      async findActiveSeatsByShowtime(_id: string): Promise<Seat[]> {
        this.calls += 1;
        return [new Seat("A", 1)];
      }
    }
    const delegate = new Spy();
    await redis.del("showtime:showtime-1:seats");
    const query = new CachingShowtimeSeatsQuery(
      delegate,
      new RedisCache(redis),
      60_000,
    );

    const first = await query.findActiveSeatsByShowtime("showtime-1");
    const second = await query.findActiveSeatsByShowtime("showtime-1");

    expect(delegate.calls).toBe(1);
    expect(second[0]).toBeInstanceOf(Seat);
    expect(second[0]!.label).toBe("A-1");
    expect(second).toEqual(first);
  });
});
