import { describe, expect, it } from "vitest";
import { BookingDraft } from "../booking-draft";
import { Seat } from "../seat";

describe("BookingDraft (FE 도메인: 예약 초안)", () => {
  it("회차로 생성되며, 처음에는 좌석·이메일이 비어 있다", () => {
    const draft = new BookingDraft("showtime-1");

    expect(draft.seat).toBeUndefined();
    expect(draft.customerEmail).toBe("");
    expect(draft.isValid).toBe(false);
  });

  it("빈 회차로는 생성할 수 없다", () => {
    expect(() => new BookingDraft("")).toThrow();
  });

  it("좌석 선택은 하나만 유지한다 (나중에 선택한 게 이긴다)", () => {
    const draft = new BookingDraft("showtime-1");

    draft.selectSeat(new Seat("A", 7));
    expect(draft.seat?.label).toBe("A-7");

    draft.selectSeat(new Seat("B", 3));
    expect(draft.seat?.label).toBe("B-3");
  });

  it("좌석과 유효한 이메일이 모두 있어야 isValid다", () => {
    const draft = new BookingDraft("showtime-1");

    draft.selectSeat(new Seat("A", 7));
    expect(draft.isValid).toBe(false);

    draft.setCustomerEmail("not-an-email");
    expect(draft.isValid).toBe(false);

    draft.setCustomerEmail("hoon@example.com");
    expect(draft.isValid).toBe(true);
  });
});
