import express from "express";
import cors from "cors";
import { ping } from "@cinema/shared";
import { CreateReservationUseCase } from "../../application/use-cases/create-reservation";
import { CancelReservationUseCase } from "../../application/use-cases/cancel-reservation";
import type { ReservationRepository } from "../../application/ports/reservation-repository";
import { createReservationRouter } from "./reservation-routes";

export function createApp(repository: ReservationRepository) {
  const createReservationUseCase = new CreateReservationUseCase(repository);
  const cancelReservationUseCase = new CancelReservationUseCase(repository);

  const app = express();
  app.use(express.json());
  app.use(cors());

  app.get("/health", (_req, res) => {
    res.json({ server: "ok", shared: ping() });
  });

  app.use(createReservationRouter(createReservationUseCase, cancelReservationUseCase));

  return app;
}