import { describe, expect, it } from "vitest";
import { Reservation } from "../../domain/reservation";
import { Seat } from "../../domain/seat";
import type { ReservationLister } from "../ports/reservation-repository";
import { ListReservationsUseCase } from "../use-cases/list-reservations";

class FakeReservationLister implements ReservationLister {
  private readonly reservations: Reservation[];

  constructor(reservations: Reservation[]) {
    this.reservations = reservations;
  }

  async listByCustomerEmail(email: string): Promise<Reservation[]> {
    return this.reservations.filter((r) => r.customerEmail === email);
  }
}

describe("ListReservationsUseCase", () => {
  const reservations = [
    new Reservation(
      "r-1",
      "showtime-1",
      new Seat("A", 1),
      "hoon@example.com",
      "CONFIRMED",
    ),
    new Reservation(
      "r-2",
      "showtime-1",
      new Seat("B", 2),
      "hoon@example.com",
      "CANCELLED",
    ),
  ];

  it("이메일의 예약 목록을 반환한다 (AC-32)", async () => {
    const useCase = new ListReservationsUseCase(
      new FakeReservationLister(reservations),
    );

    const result = await useCase.execute("hoon@example.com");

    expect(result).toHaveLength(2);
    expect(result[1].status).toBe("CANCELLED");
  });

  it("예약 없는 이메일은 빈 배열을 반환한다", async () => {
    const useCase = new ListReservationsUseCase(
      new FakeReservationLister(reservations),
    );

    const result = await useCase.execute("nobody@example.com");

    expect(result).toEqual([]);
  });
});
