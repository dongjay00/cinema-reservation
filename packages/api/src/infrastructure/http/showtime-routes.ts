import { Router } from "express";
import { ShowtimeNotFoundError } from "../../application/errors";
import type { GetShowtimeSeatsUseCase } from "../../application/use-cases/get-showtime-seats";
import type { ListShowtimesUseCase } from "../../application/use-cases/list-showtimes";
import type { Showtime } from "../../domain/showtime";

export function createShowtimeRouter(
  listShowtimesUseCase: ListShowtimesUseCase,
  getShowtimeSeatsUseCase: GetShowtimeSeatsUseCase,
): Router {
  const router = Router();

  router.get("/showtimes", async (_req, res) => {
    const showtimes = await listShowtimesUseCase.execute();
    res.json(showtimes.map(toShowtimeResponse));
  });

  router.get("/showtimes/:id/seats", async (req, res) => {
    try {
      const seats = await getShowtimeSeatsUseCase.execute(req.params.id);
      res.json(
        seats.map(({ seat, available }) => ({
          seatLabel: seat.label,
          available,
        })),
      );
    } catch (err) {
      if (err instanceof ShowtimeNotFoundError) {
        res.status(404).json({ error: err.message });
      } else {
        res
          .status(500)
          .json({ error: err instanceof Error ? err.message : "server error" });
      }
    }
  });

  return router;
}

function toShowtimeResponse(showtime: Showtime) {
  return {
    id: showtime.id,
    movieTitle: showtime.movie.title,
    startsAt: showtime.startsAt.toISOString(),
  };
}
