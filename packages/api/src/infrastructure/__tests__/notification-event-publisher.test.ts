import { afterEach, describe, expect, it, vi } from "vitest";
import { Reservation } from "../../domain/reservation";
import { Seat } from "../../domain/seat";
import { NotificationEventPublisher } from "../notification-event-publisher";

describe("NotificationEventPublisher (AC-26)", () => {
  const info = vi.spyOn(console, "info");

  afterEach(() => {
    info.mockClear();
  });

  it("ReservationCreated이면 예약 확정 알림을 로그로 남긴다", async () => {
    const reservation = Reservation.create(
      "showtime-1",
      new Seat("A", 7),
      "hoon@example.com",
    );

    const publisher = new NotificationEventPublisher();
    await publisher.publish(reservation.takeRecordedEvents());

    expect(info).toHaveBeenCalledTimes(1);
    expect(info.mock.calls[0][0]).toContain("hoon@example.com");
    expect(info.mock.calls[0][0]).toContain("확정");
  });

  it("ReservationCancelled이면 취소 알림을 로그로 남긴다", async () => {
    const reservation = Reservation.create(
      "showtime-1",
      new Seat("A", 7),
      "hoon@example.com",
    );
    reservation.takeRecordedEvents();
    reservation.cancel();

    const publisher = new NotificationEventPublisher();
    await publisher.publish(reservation.takeRecordedEvents());

    expect(info).toHaveBeenCalledTimes(1);
    expect(info.mock.calls[0][0]).toContain("취소");
  });
});
