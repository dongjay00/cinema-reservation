import { describe, expect, it } from "vitest";
import { Movie } from "../movie";

describe("Movie (AC-01~03)", () => {
  it("AC-01: 유효한 제목과 상영 시간으로 영화가 생성된다", () => {
    const movie = new Movie("인셉션", 148);

    expect(movie.title).toBe("인셉션");
    expect(movie.durationMinutes).toBe(148);
    expect(movie.id).toBeTruthy();
  });

  it("AC-01: 제목은 좌우 공백이 제거된 채 보존된다", () => {
    const movie = new Movie("  인셉션  ", 148);
    expect(movie.title).toBe("인셉션");
  });

  it("AC-02: 공백만으로 된 제목의 영화 생성은 예외를 던진다", () => {
    expect(() => new Movie("   ", 148)).toThrow();
    expect(() => new Movie("", 148)).toThrow();
  });

  it("AC-03: 0 이하의 상영 시간으로 영화 생성은 예외를 던진다", () => {
    expect(() => new Movie("인셉션", 0)).toThrow();
    expect(() => new Movie("인셉션", -10)).toThrow();
  });
});