import { describe, expect, it } from "vitest";
import { Reservation } from "../../domain/reservation";
import { Seat } from "../../domain/seat";
import { ReservationNotFoundError } from "../errors";
import type { CancelReservationRepository } from "../ports/reservation-repository";
import { CancelReservationUseCase } from "../use-cases/cancel-reservation";

class FakeReservationRepository implements CancelReservationRepository {
  private readonly reservations = new Map<string, Reservation>();

  async findById(id: string): Promise<Reservation | undefined> {
    return this.reservations.get(id);
  }

  async save(reservation: Reservation): Promise<void> {
    this.reservations.set(reservation.id, reservation);
  }
}

describe("CancelReservationUseCase", () => {
  const makeScenario = async () => {
    const repo = new FakeReservationRepository();
    const reservation = new Reservation(
      "showtime-1",
      new Seat("A", 7),
      "hoon@example.com",
    );
    await repo.save(reservation);
    return { useCase: new CancelReservationUseCase(repo), repo, reservation };
  };

  it("존재하는 예약을 취소하면 상태가 CANCELLED가 된다", async () => {
    const { useCase, reservation } = await makeScenario();

    const cancelled = await useCase.execute(reservation.id);

    expect(cancelled.status).toBe("CANCELLED");
  });

  it("존재하지 않는 예약 취소는 ReservationNotFoundError를 던진다", async () => {
    const { useCase } = await makeScenario();

    await expect(useCase.execute("존재하지않는-아이디")).rejects.toBeInstanceOf(
      ReservationNotFoundError,
    );
  });

  it("이미 취소된 예약의 재취소는 도메인 규칙으로 실패한다", async () => {
    const { useCase, reservation } = await makeScenario();
    await useCase.execute(reservation.id);

    await expect(useCase.execute(reservation.id)).rejects.toThrow();
  });
});