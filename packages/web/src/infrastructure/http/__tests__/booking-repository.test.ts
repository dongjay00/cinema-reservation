import { afterEach, describe, expect, it, vi } from "vitest";
import { DuplicateSeatError } from "../../../application/errors";
import { Seat } from "../../../domain/seat";
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
      vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify(body), { status: 201 })),
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
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "already reserved" }), {
          status: 409,
        }),
      ),
    );

    const repo = new HttpReservationRepository("http://localhost:4000");
    await expect(
      repo.create({
        showtimeId: "showtime-1",
        seat: new Seat("A", 7),
        customerEmail: "hoon@example.com",
      }),
    ).rejects.toBeInstanceOf(DuplicateSeatError);
  });

  it("create: 409 도메인 메시지를 그대로 전달한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: "Seat A-7 is already reserved for showtime",
          }),
          { status: 409 },
        ),
      ),
    );

    const repo = new HttpReservationRepository("http://localhost:4000");
    await expect(
      repo.create({
        showtimeId: "showtime-1",
        seat: new Seat("A", 7),
        customerEmail: "hoon@example.com",
      }),
    ).rejects.toThrow("is already reserved for showtime");
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
      vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify(body), { status: 200 })),
    );

    const repo = new HttpReservationRepository("http://localhost:4000");
    const reservation = await repo.cancel("res-1");

    expect(reservation.status).toBe("CANCELLED");
  });

  it("cancel: 오류 응답의 도메인 메시지를 그대로 전달한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: "Cannot cancel an already cancelled reservation",
          }),
          { status: 400 },
        ),
      ),
    );

    const repo = new HttpReservationRepository("http://localhost:4000");
    await expect(repo.cancel("res-1")).rejects.toThrow(
      "Cannot cancel an already cancelled reservation",
    );
  });

  it("listByCustomerEmail: 배열 응답을 Reservation 목록으로 변환한다", async () => {
    const body = [
      {
        id: "res-1",
        showtimeId: "showtime-1",
        seatLabel: "A-7",
        customerEmail: "hoon@example.com",
        status: "CONFIRMED",
      },
      {
        id: "res-2",
        showtimeId: "showtime-1",
        seatLabel: "B-3",
        customerEmail: "hoon@example.com",
        status: "CANCELLED",
      },
    ];
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify(body), { status: 200 })),
    );

    const repo = new HttpReservationRepository("http://localhost:4000");
    const reservations = await repo.listByCustomerEmail("hoon@example.com");

    expect(reservations).toHaveLength(2);
    expect(reservations[0].seat.label).toBe("A-7");
    expect(reservations[1].status).toBe("CANCELLED");
  });

  it("listByCustomerEmail: 오류 응답의 도메인 메시지를 그대로 전달한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "customerEmail is invalid" }), {
          status: 400,
        }),
      ),
    );

    const repo = new HttpReservationRepository("http://localhost:4000");
    await expect(repo.listByCustomerEmail("bad")).rejects.toThrow(
      "customerEmail is invalid",
    );
  });

  it("오류 응답 본문이 JSON이 아니면 상태 코드 기반 메시지로 대체한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response("Internal Server Error", { status: 500 }),
        ),
    );

    const repo = new HttpReservationRepository("http://localhost:4000");
    await expect(repo.cancel("res-1")).rejects.toThrow(
      "Reservation API returned 500",
    );
  });
});
