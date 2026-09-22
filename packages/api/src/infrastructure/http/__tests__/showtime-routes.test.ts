import { describe, expect, it } from "vitest";
import request from "supertest";
import type { Express } from "express";
import { InMemoryReservationRepository } from "../../in-memory-reservation-repository";
import { createApp } from "../app";

describe("showtime routes", () => {
  const app: Express = createApp(new InMemoryReservationRepository());

  it("GET /showtimes: 상영회차 목록을 반환한다", async () => {
    const res = await request(app).get("/showtimes");

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].id).toBeTruthy();
    expect(res.body[0].movieTitle).toBeTruthy();
  });

  it("GET /showtimes/:id/seats: 전체 좌석과 예약 가능 여부를 반환한다", async () => {
    const showtimes = await request(app).get("/showtimes");
    const showtimeId = showtimes.body[0].id;

    const res = await request(app).get(`/showtimes/${showtimeId}/seats`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(24);
    expect(res.body[0]).toHaveProperty("seatLabel");
    expect(res.body[0]).toHaveProperty("available");
  });
});