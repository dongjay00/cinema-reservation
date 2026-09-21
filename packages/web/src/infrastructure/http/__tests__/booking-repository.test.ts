import { afterEach, describe, expect, it, vi } from "vitest";
import { Seat } from "../../../domain/seat";
import { DuplicateSeatError } from "../../../application/errors";
import { HttpReservationRepository } from "../booking-repository";

describe("HttpReservationRepository (HTTP 어댑터)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("create: 201 응답을 도메인 Reservation으로 변환한다", async () => {
    const body = {
      id: "res-1",
      showtimeId: "showtime-1",
      seatLabel: "A-7",
      customerEmail: "hoon@example.com",
      status: "CONFIRMED",
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status: 201 })),
    );

    const repo = new HttpReservationRepository("http://localhost:4000");
    const reservation = await repo.create({
      showtimeId: "showtime-1",
      seat: new Seat("A", 7),
      customerEmail: "hoon@example.com",
    });

    expect(reservation.id).toBe("res-1");
    expect(reservation.seat.label).toBe("A-7");
    expect(reservation.status).toBe("CONFIRMED");
  });

  it("create: 409 응답은 DuplicateSeatError로 변환한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: "already reserved" }), { status: 409 })),
    );

    const repo = new HttpReservationRepository("http://localhost:4000");
    await expect(
      repo.create({ showtimeId: "showtime-1", seat: new Seat("A", 7), customerEmail: "hoon@example.com" }),
    ).rejects.toBeInstanceOf(DuplicateSeatError);
  });

  it("cancel: 200 응답의 status가 CANCELLED인 Reservation을 반환한다", async () => {
    const body = {
      id: "res-1",
      showtimeId: "showtime-1",
      seatLabel: "A-7",
      customerEmail: "hoon@example.com",
      status: "CANCELLED",
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status: 200 })),
    );

    const repo = new HttpReservationRepository("http://localhost:4000");
    const reservation = await repo.cancel("res-1");

    expect(reservation.status).toBe("CANCELLED");
  });
});