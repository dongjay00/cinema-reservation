import { describe, expect, it } from "vitest";
import { Reservation } from "../../domain/reservation";
import { Seat } from "../../domain/seat";
import type { ReservationsByCustomerQuery } from "../ports/reservation-repository";
import { ListReservationsByCustomerUseCase } from "../use-cases/list-reservations-by-customer";

class FakeReservationsQuery implements ReservationsByCustomerQuery {
  constructor(private readonly reservations: Reservation[]) {}

  async findByCustomerEmail(email: string): Promise<Reservation[]> {
    return this.reservations.filter((r) => r.customerEmail === email);
  }
}

describe("ListReservationsByCustomerUseCase (AC-30, AC-32)", () => {
  const cancelled = new Reservation(
    "showtime-1",
    new Seat("C", 3),
    "hoon@example.com",
    "r-3",
  );
  cancelled.cancel();

  const reservations = [
    new Reservation("showtime-1", new Seat("A", 1), "hoon@example.com", "r-1"),
    new Reservation("showtime-1", new Seat("B", 2), "hoon@example.com", "r-2"),
    cancelled,
  ];

  it("주어진 이메일의 모든 예약을 (상태 포함) 반환한다", async () => {
    const useCase = new ListReservationsByCustomerUseCase(
      new FakeReservationsQuery(reservations),
    );

    const result = await useCase.execute("hoon@example.com");

    expect(result).toHaveLength(3);
    expect(result.map((r) => r.id)).toEqual(["r-1", "r-2", "r-3"]);
    expect(result[2].status).toBe("CANCELLED");
  });

  it("예약이 없는 이메일이면 빈 배열을 반환한다", async () => {
    const useCase = new ListReservationsByCustomerUseCase(
      new FakeReservationsQuery(reservations),
    );

    const result = await useCase.execute("nobody@example.com");

    expect(result).toEqual([]);
  });
});
