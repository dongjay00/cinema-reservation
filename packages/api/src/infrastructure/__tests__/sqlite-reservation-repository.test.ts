import { DatabaseSync } from "node:sqlite";
import { describe, expect, it } from "vitest";
import { Reservation } from "../../domain/reservation";
import { Seat } from "../../domain/seat";
import { SqliteReservationRepository } from "../sqlite-reservation-repository";

const makeRepo = () =>
  new SqliteReservationRepository(new DatabaseSync(":memory:"));

describe("SqliteReservationRepository", () => {
  it("save 후 findById로 (상태 포함) 재구성한다", async () => {
    const repo = makeRepo();
    const reservation = new Reservation(
      "showtime-1",
      new Seat("A", 7),
      "hoon@example.com",
      "res-1",
    );

    await repo.save(reservation);
    const loaded = await repo.findById("res-1");

    expect(loaded?.id).toBe("res-1");
    expect(loaded?.seat.label).toBe("A-7");
    expect(loaded?.status).toBe("CONFIRMED");
  });

  it("취소된 예약도 저장 후 상태가 유지된다", async () => {
    const repo = makeRepo();
    const reservation = new Reservation(
      "showtime-1",
      new Seat("A", 7),
      "hoon@example.com",
      "res-1",
    );
    reservation.cancel();

    await repo.save(reservation);
    const loaded = await repo.findById("res-1");

    expect(loaded?.status).toBe("CANCELLED");
  });

  it("활성(CONFIRMED) 예약이 있는 좌석을 찾는다", async () => {
    const repo = makeRepo();
    const seat = new Seat("A", 7);
    await repo.save(
      new Reservation("showtime-1", seat, "hoon@example.com", "res-1"),
    );

    const found = await repo.findActiveByShowtimeAndSeat("showtime-1", seat);

    expect(found?.id).toBe("res-1");
  });

  it("취소된 예약만 있는 좌석은 활성 좌석이 아니다", async () => {
    const repo = makeRepo();
    const seat = new Seat("A", 7);
    const reservation = new Reservation(
      "showtime-1",
      seat,
      "hoon@example.com",
      "res-1",
    );
    reservation.cancel();
    await repo.save(reservation);

    const found = await repo.findActiveByShowtimeAndSeat("showtime-1", seat);

    expect(found).toBeUndefined();
  });

  it("같은 id로 다시 save하면 갱신된다 (upsert: 취소 후 재저장)", async () => {
    const repo = makeRepo();
    const seat = new Seat("A", 7);
    const reservation = new Reservation(
      "showtime-1",
      seat,
      "hoon@example.com",
      "res-1",
    );
    await repo.save(reservation);

    reservation.cancel();
    await repo.save(reservation);

    const loaded = await repo.findById("res-1");
    expect(loaded?.status).toBe("CANCELLED");
  });

  it("findActiveSeatsByShowtime: 해당 회차의 활성 좌석만 반환한다", async () => {
    const repo = makeRepo();
    const showtimeId = "showtime-1";

    await repo.save(
      new Reservation(showtimeId, new Seat("A", 1), "hoon@example.com"),
    );
    await repo.save(
      new Reservation(showtimeId, new Seat("B", 2), "hoon@example.com"),
    );

    const cancelled = new Reservation(
      showtimeId,
      new Seat("C", 3),
      "hoon@example.com",
    );
    cancelled.cancel();
    await repo.save(cancelled);

    const active = await repo.findActiveSeatsByShowtime(showtimeId);

    expect(active.map((s) => s.label).sort()).toEqual(["A-1", "B-2"]);
  });
});
