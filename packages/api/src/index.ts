import Database from "better-sqlite3";
import { Pool } from "pg";
import { CachingShowtimeSeatsQuery } from "./infrastructure/caching-showtime-seats-query";
import { DrizzlePostgresReservationRepository } from "./infrastructure/drizzle-postgres-reservation-repository";
import { DrizzleSqliteReservationRepository } from "./infrastructure/drizzle-sqlite-reservation-repository";
import { createApp } from "./infrastructure/http/app";
import { InMemoryCache } from "./infrastructure/in-memory-cache";
import { NotificationEventPublisher } from "./infrastructure/notification-event-publisher";

const databaseUrl = process.env.DATABASE_URL;

const repository = databaseUrl
  ? new DrizzlePostgresReservationRepository(
      new Pool({ connectionString: databaseUrl }),
    )
  : new DrizzleSqliteReservationRepository(new Database("data.db"));

const publisher = new NotificationEventPublisher();
const app = createApp(
  repository,
  publisher,
  new CachingShowtimeSeatsQuery(repository, new InMemoryCache()),
);
const PORT = 4000;
app.listen(PORT, () => console.log(`api on http://localhost:${PORT}`));
