import express from "express";
import { ping } from "@cinema/shared";
import { CreateReservationUseCase } from "../../application/use-cases/create-reservation";
import { CancelReservationUseCase } from "../../application/use-cases/cancel-reservation";
import { InMemoryReservationRepository } from "../in-memory-reservation-repository";
import { createReservationRouter } from "./reservation-routes";

export function createApp() {
  const repository = new InMemoryReservationRepository();
  const createReservationUseCase = new CreateReservationUseCase(repository);
  const cancelReservationUseCase = new CancelReservationUseCase(repository);

  const app = express();
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ server: "ok", shared: ping() });
  });

  app.use(createReservationRouter(createReservationUseCase, cancelReservationUseCase));

  return app;
}