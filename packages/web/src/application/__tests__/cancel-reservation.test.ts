import { describe, expect, it } from "vitest";
import { Reservation } from "../../domain/reservation";
import { Seat } from "../../domain/seat";
import type { ReservationRepository } from "../ports/reservation-repository";
import { CancelReservationUseCase } from "../use-cases/cancel-reservation";

class FakeReservationRepository implements ReservationRepository {
  async create(): Promise<Reservation> {
    throw new Error("이 테스트에서 미사용");
  }

  async cancel(id: string): Promise<Reservation> {
    return new Reservation(
      id,
      "showtime-1",
      new Seat("A", 1),
      "hoon@example.com",
      "CANCELLED",
    );
  }
}

describe("CancelReservationUseCase", () => {
  it("취소를 수행하고 취소된 예약을 반환한다", async () => {
    const useCase = new CancelReservationUseCase(
      new FakeReservationRepository(),
    );

    const reservation = await useCase.execute("res-1");

    expect(reservation.id).toBe("res-1");
    expect(reservation.status).toBe("CANCELLED");
  });
});
