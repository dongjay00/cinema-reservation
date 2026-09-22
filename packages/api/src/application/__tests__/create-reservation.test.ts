import { describe, expect, it } from "vitest";
import { Reservation } from "../../domain/reservation";
import { Seat } from "../../domain/seat";
import { InMemoryReservationRepository } from "../../infrastructure/in-memory-reservation-repository";
import { DuplicateReservationError } from "../errors";
import { CreateReservationUseCase } from "../use-cases/create-reservation";

describe("CreateReservationUseCase (FR-07 중복 예약 금지)", () => {
  const makeUseCase = () => {
    const repo = new InMemoryReservationRepository();
    return { useCase: new CreateReservationUseCase(repo), repo };
  };

  it("유효한 입력으로 예약을 생성하고 저장소에 저장한다", async () => {
    const { useCase, repo } = makeUseCase();

    const reservation = await useCase.execute({
      showtimeId: "showtime-1",
      seat: new Seat("A", 7),
      customerEmail: "hoon@example.com",
    });

    expect(reservation).toBeInstanceOf(Reservation);
    expect(reservation.status).toBe("CONFIRMED");
    expect(await repo.findById(reservation.id)).toBe(reservation);
  });

  it("같은 회차·같은 좌석에 활성 예약이 있으면 중복 예약을 거부한다", async () => {
    const { useCase } = makeUseCase();
    const input = {
      showtimeId: "showtime-1",
      seat: new Seat("A", 7),
      customerEmail: "hoon@example.com",
    };

    await useCase.execute(input);

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(
      DuplicateReservationError,
    );
  });

  it("취소된 좌석은 다시 예약할 수 있다", async () => {
    const { useCase } = makeUseCase();
    const input = {
      showtimeId: "showtime-1",
      seat: new Seat("A", 7),
      customerEmail: "hoon@example.com",
    };

    const first = await useCase.execute(input);
    first.cancel();

    const second = await useCase.execute(input);
    expect(second.status).toBe("CONFIRMED");
  });
});
