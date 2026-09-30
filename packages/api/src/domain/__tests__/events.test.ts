import { describe, expect, it } from "vitest";
import { ReservationCancelled, ReservationCreated } from "../events";
import { Reservation } from "../reservation";
import { Seat } from "../seat";

describe("도메인 이벤트 (AC-21~23, AC-25)", () => {
  it("Reservation.create는 ReservationCreated 이벤트를 기록한다", () => {
    const reservation = Reservation.create(
      "showtime-1",
      new Seat("A", 7),
      "hoon@example.com",
    );

    const events = reservation.takeRecordedEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(ReservationCreated);
    expect((events[0] as ReservationCreated).reservationId).toBe(
      reservation.id,
    );
  });

  it("cancel()은 ReservationCancelled 이벤트를 기록한다", () => {
    const reservation = Reservation.create(
      "showtime-1",
      new Seat("A", 7),
      "hoon@example.com",
    );
    reservation.takeRecordedEvents();
    reservation.cancel();

    const events = reservation.takeRecordedEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(ReservationCancelled);
  });

  it("takeRecordedEvents는 기록을 돌려준 뒤 비운다", () => {
    const reservation = Reservation.create(
      "showtime-1",
      new Seat("A", 7),
      "hoon@example.com",
    );
    reservation.takeRecordedEvents();

    expect(reservation.takeRecordedEvents()).toHaveLength(0);
  });

  it("저장소 재구성 경로(new Reservation)는 이벤트를 기록하지 않는다", () => {
    const reservation = new Reservation(
      "showtime-1",
      new Seat("A", 7),
      "hoon@example.com",
    );

    expect(reservation.takeRecordedEvents()).toHaveLength(0);
  });
});
