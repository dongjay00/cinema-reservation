import { Router } from "express";
import {
  DuplicateReservationError,
  ReservationNotFoundError,
} from "../../application/errors";
import type { CancelReservationUseCase } from "../../application/use-cases/cancel-reservation";
import type { CreateReservationUseCase } from "../../application/use-cases/create-reservation";
import type { Reservation } from "../../domain/reservation";
import { Seat } from "../../domain/seat";

export function createReservationRouter(
  createReservationUseCase: CreateReservationUseCase,
  cancelReservationUseCase: CancelReservationUseCase,
): Router {
  const router = Router();

  router.post("/reservations", async (req, res) => {
    try {
      const { showtimeId, row, number, customerEmail } = req.body;

      const reservation = await createReservationUseCase.execute({
        showtimeId,
        seat: new Seat(row, number),
        customerEmail,
      });

      res.status(201).json(toResponse(reservation));
    } catch (err) {
      if (err instanceof DuplicateReservationError) {
        res.status(409).json({ error: err.message });
      } else {
        res.status(400).json({
          error: err instanceof Error ? err.message : "invalid request",
        });
      }
    }
  });

  router.post("/reservations/:id/cancel", async (req, res) => {
    try {
      const reservation = await cancelReservationUseCase.execute(req.params.id);
      res.json(toResponse(reservation));
    } catch (err) {
      if (err instanceof ReservationNotFoundError) {
        res.status(404).json({ error: err.message });
      } else {
        res.status(400).json({
          error: err instanceof Error ? err.message : "invalid request",
        });
      }
    }
  });

  return router;
}

function toResponse(reservation: Reservation) {
  return {
    id: reservation.id,
    showtimeId: reservation.showtimeId,
    seatLabel: reservation.seat.label,
    customerEmail: reservation.customerEmail,
    status: reservation.status,
  };
}
