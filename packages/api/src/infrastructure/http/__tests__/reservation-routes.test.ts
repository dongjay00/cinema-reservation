import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import type { Express } from "express";
import { createApp } from "../app";

let app: Express;

beforeEach(() => {
  app = createApp();
});

describe("POST /reservations", () => {
  it("유효한 요청이면 201과 CONFIRMED 예약을 반환한다", async () => {
    const res = await request(app)
      .post("/reservations")
      .send({ showtimeId: "showtime-1", row: "A", number: 7, customerEmail: "hoon@example.com" });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("CONFIRMED");
    expect(res.body.seatLabel).toBe("A-7");
    expect(res.body.id).toBeTruthy();
  });

  it("같은 회차·같은 좌석이면 409(충돌)를 반환한다", async () => {
    const body = { showtimeId: "showtime-1", row: "A", number: 7, customerEmail: "hoon@example.com" };

    await request(app).post("/reservations").send(body);
    const res = await request(app).post("/reservations").send(body);

    expect(res.status).toBe(409);
  });
});

describe("POST /reservations/:id/cancel", () => {
  it("주어진 예약을 취소하고 200과 CANCELLED를 반환한다", async () => {
    const created = await request(app)
      .post("/reservations")
      .send({ showtimeId: "showtime-1", row: "B", number: 3, customerEmail: "hoon@example.com" });

    const res = await request(app).post(`/reservations/${created.body.id}/cancel`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("CANCELLED");
  });

  it("존재하지 않는 예약 취소는 404를 반환한다", async () => {
    const res = await request(app).post("/reservations/없는-아이디/cancel");

    expect(res.status).toBe(404);
  });
});