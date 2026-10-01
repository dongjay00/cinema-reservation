import { describe, expect, it } from "vitest";
import { parseReservationEvent } from "../parse-reservation-event";

describe("parseReservationEvent", () => {
  it("ReservationCreated 페이로드를 파싱한다", () => {
    const dto = parseReservationEvent(
      JSON.stringify({
        type: "ReservationCreated",
        reservationId: "res-1",
        showtimeId: "showtime-1",
        seatRow: "A",
        seatNumber: 1,
        customerEmail: "hoon@example.com",
      }),
    );
    expect(dto).toMatchObject({ type: "ReservationCreated", seatNumber: 1 });
  });

  it("ReservationCancelled 페이로드를 파싱한다", () => {
    const dto = parseReservationEvent(
      JSON.stringify({
        type: "ReservationCancelled",
        reservationId: "res-1",
        customerEmail: "hoon@example.com",
      }),
    );
    expect(dto.type).toBe("ReservationCancelled");
  });

  it("알 수 없는 페이로드면 에러를 던진다", () => {
    expect(() => parseReservationEvent('{"type":"Nope"}')).toThrow();
  });
});
