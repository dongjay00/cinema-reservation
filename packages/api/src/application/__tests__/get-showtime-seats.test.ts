import { describe, expect, it } from "vitest";
import { Reservation } from "../../domain/reservation";
import { Seat } from "../../domain/seat";
import { GetShowtimeSeatsUseCase } from "../use-cases/get-showtime-seats";
import { InMemoryReservationRepository } from "../../infrastructure/in-memory-reservation-repository";
import { InMemoryShowtimeRepository } from "../../infrastructure/in-memory-showtime-repository";

describe("GetShowtimeSeatsUseCase", () => {
  it("예약된 좌석은 available=false, 빈 좌석은 true로 표시한다", async () => {
    const reservationRepository = new InMemoryReservationRepository();
    const showtimeRepository = new InMemoryShowtimeRepository();
    const showtime = (await showtimeRepository.findAll())[0];

    await reservationRepository.save(
      new Reservation(showtime.id, new Seat("A", 1), "hoon@example.com"),
    );

    const useCase = new GetShowtimeSeatsUseCase(reservationRepository, showtimeRepository);
    const seats = await useCase.execute(showtime.id);

    expect(seats.find((s) => s.seat.equals(new Seat("A", 1)))?.available).toBe(false);
    expect(seats.find((s) => s.seat.equals(new Seat("A", 2)))?.available).toBe(true);
    expect(seats.length).toBe(24); // A·B·C × 1..8
  });

  it("존재하지 않는 회차면 예외를 던진다", async () => {
    const useCase = new GetShowtimeSeatsUseCase(
      new InMemoryReservationRepository(),
      new InMemoryShowtimeRepository(),
    );

    await expect(useCase.execute("없는-회차")).rejects.toThrow();
  });
});