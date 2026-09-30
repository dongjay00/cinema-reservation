import type Redis from "ioredis";
import type { Cache } from "../application/ports/cache";

export class RedisCache implements Cache {
  constructor(private readonly redis: Redis) {}

  async get<T>(key: string): Promise<T | undefined> {
    const raw = await this.redis.get(key);
    if (raw === null) {
      return undefined;
    }
    return JSON.parse(raw) as T;
  }

  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), "PX", ttlMs);
  }
}
