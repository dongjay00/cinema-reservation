import { afterEach, describe, expect, it, vi } from "vitest";
import { HttpShowtimeRepository } from "../showtime-repository";

describe("HttpShowtimeRepository (HTTP 어댑터)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("listShowtimes: DTO를 도메인 Showtime으로 변환한다", async () => {
    const body = [
      {
        id: "showtime-1",
        movieTitle: "인셉션",
        startsAt: "2026-09-20T10:00:00.000Z",
      },
    ];
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify(body), { status: 200 })),
    );

    const repo = new HttpShowtimeRepository("http://localhost:4000");
    const showtimes = await repo.listShowtimes();

    expect(showtimes[0].id).toBe("showtime-1");
    expect(showtimes[0].movieTitle).toBe("인셉션");
  });

  it("listSeats: 좌석 상태를 도메인으로 변환한다", async () => {
    const body = [
      { seatLabel: "A-1", available: false },
      { seatLabel: "A-2", available: true },
    ];
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify(body), { status: 200 })),
    );

    const repo = new HttpShowtimeRepository("http://localhost:4000");
    const seats = await repo.listSeats("showtime-1");

    expect(seats[0].seat.label).toBe("A-1");
    expect(seats[0].available).toBe(false);
    expect(seats[1].seat.label).toBe("A-2");
    expect(seats[1].available).toBe(true);
  });
});
