import { describe, expect, it } from "vitest";
import { Reservation } from "../reservation";
import { Seat } from "../seat";

describe("Reservation (AC-09~12)", () => {
  const seat = () => new Seat("A", 7);
  const showtimeId = () => "showtime-1";

  it("AC-09: 예약 생성 시 상태는 CONFIRMED다", () => {
    const r = new Reservation(showtimeId(), seat(), "hoon@example.com");

    expect(r.status).toBe("CONFIRMED");
    expect(r.showtimeId).toBe("showtime-1");
    expect(r.customerEmail).toBe("hoon@example.com");
  });

  it("AC-10: cancel() 후 상태는 CANCELLED다", () => {
    const r = new Reservation(showtimeId(), seat(), "hoon@example.com");
    r.cancel();

    expect(r.status).toBe("CANCELLED");
  });

  it("AC-11: 이미 취소된 예약의 재취소는 예외를 던진다", () => {
    const r = new Reservation(showtimeId(), seat(), "hoon@example.com");
    r.cancel();

    expect(() => r.cancel()).toThrow();
  });

  it("AC-12: 잘못된 이메일로 예약 생성은 예외를 던진다", () => {
    expect(() => new Reservation(showtimeId(), seat(), "")).toThrow();
    expect(
      () => new Reservation(showtimeId(), seat(), "not-an-email"),
    ).toThrow();
  });
});
