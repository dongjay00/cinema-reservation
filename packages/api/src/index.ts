import { DatabaseSync } from "node:sqlite";
import { Pool } from "pg";
import { createApp } from "./infrastructure/http/app";
import { NotificationEventPublisher } from "./infrastructure/notification-event-publisher";
import { PostgresReservationRepository } from "./infrastructure/postgres-reservation-repository";
import { SqliteReservationRepository } from "./infrastructure/sqlite-reservation-repository";

const databaseUrl = process.env.DATABASE_URL;

const repository = databaseUrl
  ? new PostgresReservationRepository(
      new Pool({ connectionString: databaseUrl }),
    )
  : new SqliteReservationRepository(new DatabaseSync("data.db"));

const publisher = new NotificationEventPublisher();
const app = createApp(repository, publisher);
const PORT = 4000;
app.listen(PORT, () => console.log(`api on http://localhost:${PORT}`));
