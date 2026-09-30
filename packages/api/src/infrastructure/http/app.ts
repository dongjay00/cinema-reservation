import { ping } from "@cinema/shared";
import cors from "cors";
import express from "express";
import type { EventPublisher } from "../../application/ports/event-publisher";
import type { ReservationRepository } from "../../application/ports/reservation-repository";
import { CancelReservationUseCase } from "../../application/use-cases/cancel-reservation";
import { CreateReservationUseCase } from "../../application/use-cases/create-reservation";
import { GetShowtimeSeatsUseCase } from "../../application/use-cases/get-showtime-seats";
import { ListReservationsByCustomerUseCase } from "../../application/use-cases/list-reservations-by-customer";
import { ListShowtimesUseCase } from "../../application/use-cases/list-showtimes";
import { InMemoryShowtimeRepository } from "../in-memory-showtime-repository";
import { SilentEventPublisher } from "../notification-event-publisher";
import { createReservationRouter } from "./reservation-routes";
import { createShowtimeRouter } from "./showtime-routes";

export function createApp(
  repository: ReservationRepository,
  publisher: EventPublisher = new SilentEventPublisher(),
) {
  const createReservationUseCase = new CreateReservationUseCase(
    repository,
    publisher,
  );
  const cancelReservationUseCase = new CancelReservationUseCase(
    repository,
    publisher,
  );
  const listReservationsUseCase = new ListReservationsByCustomerUseCase(
    repository,
  );
  const showtimeRepository = new InMemoryShowtimeRepository();
  const listShowtimesUseCase = new ListShowtimesUseCase(showtimeRepository);
  const getShowtimeSeatsUseCase = new GetShowtimeSeatsUseCase(
    repository,
    showtimeRepository,
  );

  const app = express();
  app.use(express.json());
  app.use(cors());

  app.get("/health", (_req, res) => {
    res.json({ server: "ok", shared: ping() });
  });

  app.use(
    createReservationRouter(
      createReservationUseCase,
      cancelReservationUseCase,
      listReservationsUseCase,
    ),
  );
  app.use(createShowtimeRouter(listShowtimesUseCase, getShowtimeSeatsUseCase));

  return app;
}
