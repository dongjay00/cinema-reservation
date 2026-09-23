import { describe, expect, it } from "vitest";
import { Reservation } from "../../domain/reservation";
import { Seat } from "../../domain/seat";
import { DuplicateReservationError } from "../errors";
import type { CreateReservationRepository } from "../ports/reservation-repository";
import { CreateReservationUseCase } from "../use-cases/create-reservation";

class FakeReservationRepository implements CreateReservationRepository {
  readonly reservations: Reservation[] = [];

  async findActiveByShowtimeAndSeat(
    showtimeId: string,
    seat: Seat,
  ): Promise<Reservation | undefined> {
    return this.reservations.find(
      (r) =>
        r.showtimeId === showtimeId &&
        r.status === "CONFIRMED" &&
        r.seat.equals(seat),
    );
  }

  async save(reservation: Reservation): Promise<void> {
    this.reservations.push(reservation);
  }
}

describe("CreateReservationUseCase (FR-07 중복 예약 금지)", () => {
  const makeUseCase = () => {
    const repo = new FakeReservationRepository();
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
    expect(repo.reservations).toContain(reservation);
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
