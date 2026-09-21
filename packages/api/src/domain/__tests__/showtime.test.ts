import { describe, expect, it } from "vitest";
import { Movie } from "../movie";
import { Showtime } from "../showtime";

describe("Showtime (AC-04~05)", () => {
  const sampleMovie = () => new Movie("인셉션", 148);

  it("AC-04: 영화와 시작 시각으로 회차가 생성된다", () => {
    const startsAt = new Date("2026-09-20T10:00:00");
    const showtime = new Showtime(sampleMovie(), startsAt);

    expect(showtime.movie.title).toBe("인셉션");
    expect(showtime.movie.durationMinutes).toBe(148);
    expect(showtime.startsAt).toEqual(startsAt);
    expect(showtime.id).toBeTruthy();
  });

  it("AC-05: 유효하지 않은 시작 시각의 회차 생성은 예외를 던진다", () => {
    expect(() => new Showtime(sampleMovie(), new Date("not-a-date"))).toThrow();
  });
});