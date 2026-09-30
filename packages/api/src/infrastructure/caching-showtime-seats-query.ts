import type { Cache } from "../application/ports/cache";
import type { ShowtimeSeatsQuery } from "../application/ports/reservation-repository";
import type { Seat } from "../domain/seat";

export class CachingShowtimeSeatsQuery implements ShowtimeSeatsQuery {
  constructor(
    private readonly delegate: ShowtimeSeatsQuery,
    private readonly cache: Cache,
    private readonly ttlMs = 5000,
  ) {}

  async findActiveSeatsByShowtime(showtimeId: string): Promise<Seat[]> {
    const key = `showtime:${showtimeId}:seats`;
    const cached = await this.cache.get<Seat[]>(key);
    if (cached) {
      return cached;
    }
    const seats = await this.delegate.findActiveSeatsByShowtime(showtimeId);
    await this.cache.set(key, seats, this.ttlMs);
    return seats;
  }
}
