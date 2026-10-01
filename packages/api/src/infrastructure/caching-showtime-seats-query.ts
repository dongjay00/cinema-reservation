import type { Cache } from "../application/ports/cache";
import type { ShowtimeSeatsQuery } from "../application/ports/reservation-repository";
import { Seat } from "../domain/seat";

type Projection = { row: string; number: number };

export function showtimeSeatsCacheKey(showtimeId: string): string {
  return `showtime:${showtimeId}:seats`;
}

export class CachingShowtimeSeatsQuery implements ShowtimeSeatsQuery {
  constructor(
    private readonly delegate: ShowtimeSeatsQuery,
    private readonly cache: Cache,
    private readonly ttlMs = 5000,
  ) {}

  async findActiveSeatsByShowtime(showtimeId: string): Promise<Seat[]> {
    const key = showtimeSeatsCacheKey(showtimeId);
    const cached = await this.cache.get<Projection[]>(key);
    if (cached) {
      return cached.map(({ row, number }) => new Seat(row, number));
    }
    const seats = await this.delegate.findActiveSeatsByShowtime(showtimeId);
    await this.cache.set(
      key,
      seats.map(({ row, number }) => ({ row, number })),
      this.ttlMs,
    );
    return seats;
  }
}
