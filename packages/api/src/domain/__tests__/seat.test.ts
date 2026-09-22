import { describe, expect, it } from "vitest";
import { Seat } from "../seat";

describe("Seat (AC-06~08)", () => {
  it("AC-06: 좌석 라벨은 행-번호 형태다", () => {
    const seat = new Seat("A", 7);
    expect(seat.label).toBe("A-7");
  });

  it("AC-07: 행·번호가 같으면 같은 좌석으로 판별된다", () => {
    const a = new Seat("A", 7);
    const b = new Seat("a", 7);
    const c = new Seat("A", 8);

    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });

  it("AC-08: 잘못된 행(공백) 또는 번호(0 이하)의 좌석 생성은 예외를 던진다", () => {
    expect(() => new Seat("", 7)).toThrow();
    expect(() => new Seat(" ", 7)).toThrow();
    expect(() => new Seat("A", 0)).toThrow();
    expect(() => new Seat("A", -1)).toThrow();
  });
});
