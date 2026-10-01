import Database from "better-sqlite3";
import Redis from "ioredis";
import { Pool } from "pg";
import { CachingShowtimeSeatsQuery } from "./infrastructure/caching-showtime-seats-query";
import { DrizzlePostgresReservationRepository } from "./infrastructure/drizzle-postgres-reservation-repository";
import { DrizzleSqliteReservationRepository } from "./infrastructure/drizzle-sqlite-reservation-repository";
import { createApp } from "./infrastructure/http/app";
import { InMemoryCache } from "./infrastructure/in-memory-cache";
import { InvalidatingEventPublisher } from "./infrastructure/invalidating-event-publisher";
import { NotificationEventPublisher } from "./infrastructure/notification-event-publisher";
import { RedisCache } from "./infrastructure/redis-cache";
import { RedisStreamEventPublisher } from "./infrastructure/redis-stream-event-publisher";

const databaseUrl = process.env.DATABASE_URL;
const redisUrl = process.env.REDIS_URL;
const redis = redisUrl ? new Redis(redisUrl) : undefined;
const cache = redis ? new RedisCache(redis) : new InMemoryCache();

const repository = databaseUrl
  ? new DrizzlePostgresReservationRepository(
      new Pool({ connectionString: databaseUrl }),
    )
  : new DrizzleSqliteReservationRepository(new Database("data.db"));

const basePublisher = redis
  ? new RedisStreamEventPublisher(redis)
  : new NotificationEventPublisher();
const publisher = new InvalidatingEventPublisher(basePublisher, cache);
const app = createApp(
  repository,
  publisher,
  new CachingShowtimeSeatsQuery(repository, cache),
);
const PORT = 4000;
app.listen(PORT, () => console.log(`api on http://localhost:${PORT}`));
