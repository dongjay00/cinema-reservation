import { DatabaseSync } from "node:sqlite";
import { SqliteReservationRepository } from "./infrastructure/sqlite-reservation-repository";
import { createApp } from "./infrastructure/http/app";

const repository = new SqliteReservationRepository(new DatabaseSync("data.db"));
const app = createApp(repository);

const PORT = 4000;
app.listen(PORT, () => console.log(`api on http://localhost:${PORT}`));