import { describe, expect, it } from "vitest";
import { Seat } from "../../domain/seat";
import type { Showtime } from "../../domain/showtime";
import type {
  SeatAvailability,
  ShowtimeRepository,
} from "../ports/showtime-repository";
import { LoadShowtimeSeatsUseCase } from "../use-cases/load-showtime-seats";

class FakeShowtimeRepository implements ShowtimeRepository {
  async listShowtimes(): Promise<Showtime[]> {
    return [];
  }

  async listSeats(_showtimeId: string): Promise<SeatAvailability[]> {
    return [
      { seat: new Seat("A", 1), available: false },
      { seat: new Seat("A", 2), available: true },
    ];
  }
}

describe("LoadShowtimeSeatsUseCase", () => {
  it("회차의 좌석 상태 목록을 그대로 전달한다", async () => {
    const useCase = new LoadShowtimeSeatsUseCase(new FakeShowtimeRepository());

    const seats = await useCase.execute("showtime-1");

    expect(seats.find((s) => s.seat.label === "A-1")?.available).toBe(false);
    expect(seats.find((s) => s.seat.label === "A-2")?.available).toBe(true);
  });
});
