import { describe, expect, it } from "vitest";
import { Showtime } from "../showtime";

describe("Showtime (FE 도메인)", () => {
  it("id·제목·시작 시각을 보유한다", () => {
    const startsAt = new Date("2026-09-20T10:00:00");
    const s = new Showtime("showtime-1", "인셉션", startsAt);

    expect(s.id).toBe("showtime-1");
    expect(s.movieTitle).toBe("인셉션");
    expect(s.startsAt.getTime()).toBe(startsAt.getTime());
  });
});
