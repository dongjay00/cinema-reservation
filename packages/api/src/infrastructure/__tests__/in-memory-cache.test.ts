import { describe, expect, it } from "vitest";
import { InMemoryCache } from "../in-memory-cache";

describe("InMemoryCache", () => {
  it("캐시에 없으면 undefined를 반환한다", async () => {
    const cache = new InMemoryCache(() => 1_000);
    await expect(cache.get("missing")).resolves.toBeUndefined();
  });

  it("set한 값을 TTL 이내에 반환한다", async () => {
    const cache = new InMemoryCache(() => 1_000);
    await cache.set("k", { seat: "A1" }, 5_000);
    await expect(cache.get("k")).resolves.toEqual({ seat: "A1" });
  });

  it("TTL이 지나면 만료되어 undefined를 반환한다", async () => {
    let now = 1_000;
    const cache = new InMemoryCache(() => now);
    await cache.set("k", "v", 5_000);
    now = 6_001;
    await expect(cache.get("k")).resolves.toBeUndefined();
  });
});
