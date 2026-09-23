import { describe, expect, it } from "vitest";
import { Movie } from "../../domain/movie";
import { Seat } from "../../domain/seat";
import { Showtime } from "../../domain/showtime";
import type { ShowtimeSeatsQuery } from "../ports/reservation-repository";
import type { ShowtimeRepository } from "../ports/showtime-repository";
import { GetShowtimeSeatsUseCase } from "../use-cases/get-showtime-seats";

class FakeReservationRepository implements ShowtimeSeatsQuery {
  private readonly activeByShowtime = new Map<string, Seat[]>();

  async findActiveSeatsByShowtime(showtimeId: string): Promise<Seat[]> {
    return this.activeByShowtime.get(showtimeId) ?? [];
  }

  reserve(showtimeId: string, seat: Seat): void {
    const seats = this.activeByShowtime.get(showtimeId) ?? [];
    seats.push(seat);
    this.activeByShowtime.set(showtimeId, seats);
  }
}

class FakeShowtimeRepository implements ShowtimeRepository {
  constructor(
    private readonly showtimes: Showtime[],
    private readonly seats: Seat[],
  ) {}

  async findAll(): Promise<Showtime[]> {
    return this.showtimes;
  }

  async findById(id: string): Promise<Showtime | undefined> {
    return this.showtimes.find((s) => s.id === id);
  }

  async listSeats(): Promise<Seat[]> {
    return this.seats;
  }
}

describe("GetShowtimeSeatsUseCase", () => {
  const makeScenario = () => {
    const showtime = new Showtime(
      new Movie("인셉션", 148),
      new Date("2026-09-20T10:00:00"),
      "showtime-1",
    );
    const seats = ["A", "B", "C"].flatMap((row) =>
      Array.from({ length: 8 }, (_, i) => new Seat(row, i + 1)),
    );
    const reservationRepository = new FakeReservationRepository();
    const showtimeRepository = new FakeShowtimeRepository([showtime], seats);

    return { showtime, reservationRepository, showtimeRepository };
  };

  it("예약된 좌석은 available=false, 빈 좌석은 true로 표시한다", async () => {
    const { showtime, reservationRepository, showtimeRepository } = makeScenario();

    reservationRepository.reserve(showtime.id, new Seat("A", 1));

    const useCase = new GetShowtimeSeatsUseCase(
      reservationRepository,
      showtimeRepository,
    );
    const result = await useCase.execute(showtime.id);

    expect(result.find((s) => s.seat.equals(new Seat("A", 1)))?.available).toBe(
      false,
    );
    expect(result.find((s) => s.seat.equals(new Seat("A", 2)))?.available).toBe(
      true,
    );
    expect(result.length).toBe(24); // A·B·C × 1..8
  });

  it("존재하지 않는 회차면 예외를 던진다", async () => {
    const { reservationRepository, showtimeRepository } = makeScenario();
    const useCase = new GetShowtimeSeatsUseCase(
      reservationRepository,
      showtimeRepository,
    );

    await expect(useCase.execute("없는-회차")).rejects.toThrow();
  });
});