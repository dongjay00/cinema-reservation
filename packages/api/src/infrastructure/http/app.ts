import express from "express";
import cors from "cors";
import { ping } from "@cinema/shared";
import { CreateReservationUseCase } from "../../application/use-cases/create-reservation";
import { CancelReservationUseCase } from "../../application/use-cases/cancel-reservation";
import { ListShowtimesUseCase } from "../../application/use-cases/list-showtimes";
import { GetShowtimeSeatsUseCase } from "../../application/use-cases/get-showtime-seats";
import type { ReservationRepository } from "../../application/ports/reservation-repository";
import { InMemoryShowtimeRepository } from "../in-memory-showtime-repository";
import { createReservationRouter } from "./reservation-routes";
import { createShowtimeRouter } from "./showtime-routes";

export function createApp(repository: ReservationRepository) {
  const createReservationUseCase = new CreateReservationUseCase(repository);
  const cancelReservationUseCase = new CancelReservationUseCase(repository);

  const showtimeRepository = new InMemoryShowtimeRepository();
  const listShowtimesUseCase = new ListShowtimesUseCase(showtimeRepository);
  const getShowtimeSeatsUseCase = new GetShowtimeSeatsUseCase(repository, showtimeRepository);

  const app = express();
  app.use(express.json());
  app.use(cors());

  app.get("/health", (_req, res) => {
    res.json({ server: "ok", shared: ping() });
  });

  app.use(createReservationRouter(createReservationUseCase, cancelReservationUseCase));
  app.use(createShowtimeRouter(listShowtimesUseCase, getShowtimeSeatsUseCase));

  return app;
}