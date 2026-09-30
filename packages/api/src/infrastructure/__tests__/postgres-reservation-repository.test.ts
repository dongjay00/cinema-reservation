import { Pool } from "pg";
import { beforeEach, describe, expect, it } from "vitest";
import { DuplicateReservationError } from "../../application/errors";
import { Reservation } from "../../domain/reservation";
import { Seat } from "../../domain/seat";
import {
  DrizzlePostgresReservationRepository,
  MIGRATION,
} from "../drizzle-postgres-reservation-repository";

const databaseUrl = process.env.DATABASE_URL;

describe.skipIf(!databaseUrl)("PostgresReservationRepository", () => {
  let pool: Pool;
  let repo: DrizzlePostgresReservationRepository;

  beforeEach(async () => {
    if (!pool) {
      pool = new Pool({ connectionString: databaseUrl });
      repo = new DrizzlePostgresReservationRepository(pool);
    }
    await pool.query(MIGRATION);
    await pool.query("DELETE FROM reservations");
  });

  it("save 후 findById로 (상태 포함) 재구성한다", async () => {
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
    const seat = new Seat("A", 7);
    await repo.save(
      new Reservation("showtime-1", seat, "hoon@example.com", "res-1"),
    );

    const found = await repo.findActiveByShowtimeAndSeat("showtime-1", seat);

    expect(found?.id).toBe("res-1");
  });

  it("취소된 예약만 있는 좌석은 활성 좌석이 아니다", async () => {
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

  it("같은 좌석에 두 번째 CONFIRMED 예약을 저장하면 DuplicateReservationError를 던진다 (AC-27)", async () => {
    const seat = new Seat("A", 7);
    await repo.save(
      new Reservation("showtime-1", seat, "hoon@example.com", "res-1"),
    );

    await expect(
      repo.save(
        new Reservation("showtime-1", seat, "other@example.com", "res-2"),
      ),
    ).rejects.toBeInstanceOf(DuplicateReservationError);
  });

  it("취소로 풀린 좌석은 다시 CONFIRMED로 저장할 수 있다 (AC-28)", async () => {
    const seat = new Seat("A", 7);

    const cancelled = new Reservation(
      "showtime-1",
      seat,
      "hoon@example.com",
      "res-1",
    );
    cancelled.cancel();
    await repo.save(cancelled);

    await expect(
      repo.save(
        new Reservation("showtime-1", seat, "other@example.com", "res-2"),
      ),
    ).resolves.toBeUndefined();
  });

  it("동시에 같은 좌석 5건을 저장하면 정확히 하나만 성공한다 (AC-29)", async () => {
    const seat = new Seat("A", 7);

    const attempts = Array.from({ length: 5 }, (_, i) =>
      repo.save(
        new Reservation("showtime-1", seat, "user@example.com", `res-${i}`),
      ),
    );

    const results = await Promise.allSettled(attempts);
    const fulfilled = results.filter((r) => r.status === "fulfilled").length;

    expect(fulfilled).toBe(1);
    expect(
      await repo.findActiveByShowtimeAndSeat("showtime-1", seat),
    ).toBeDefined();
  });

  it("이메일로 예약 목록(상태 포함)을 조회한다 (AC-30)", async () => {
    const confirmed = new Reservation(
      "showtime-1",
      new Seat("A", 1),
      "hoon@example.com",
      "r-1",
    );
    const cancelled = new Reservation(
      "showtime-1",
      new Seat("B", 2),
      "hoon@example.com",
      "r-2",
    );
    cancelled.cancel();
    await repo.save(confirmed);
    await repo.save(cancelled);
    await repo.save(
      new Reservation(
        "showtime-1",
        new Seat("C", 3),
        "other@example.com",
        "r-3",
      ),
    );

    const result = await repo.findByCustomerEmail("hoon@example.com");

    expect(result.map((r) => r.id).sort()).toEqual(["r-1", "r-2"]);
    expect(result.find((r) => r.id === "r-2")?.status).toBe("CANCELLED");
  });
});
