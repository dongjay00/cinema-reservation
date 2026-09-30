import type { Express } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryReservationRepository } from "../../in-memory-reservation-repository";
import { createApp } from "../app";

let app: Express;

beforeEach(() => {
  app = createApp(new InMemoryReservationRepository());
});

describe("POST /reservations", () => {
  it("유효한 요청이면 201과 CONFIRMED 예약을 반환한다", async () => {
    const res = await request(app).post("/reservations").send({
      showtimeId: "showtime-1",
      row: "A",
      number: 7,
      customerEmail: "hoon@example.com",
    });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("CONFIRMED");
    expect(res.body.seatLabel).toBe("A-7");
    expect(res.body.id).toBeTruthy();
  });

  it("같은 회차·같은 좌석이면 409(충돌)를 반환한다", async () => {
    const body = {
      showtimeId: "showtime-1",
      row: "A",
      number: 7,
      customerEmail: "hoon@example.com",
    };

    await request(app).post("/reservations").send(body);
    const res = await request(app).post("/reservations").send(body);

    expect(res.status).toBe(409);
  });
});

describe("POST /reservations/:id/cancel", () => {
  it("주어진 예약을 취소하고 200과 CANCELLED를 반환한다", async () => {
    const created = await request(app).post("/reservations").send({
      showtimeId: "showtime-1",
      row: "B",
      number: 3,
      customerEmail: "hoon@example.com",
    });

    const res = await request(app).post(
      `/reservations/${created.body.id}/cancel`,
    );

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("CANCELLED");
  });

  it("존재하지 않는 예약 취소는 404를 반환한다", async () => {
    const res = await request(app).post("/reservations/없는-아이디/cancel");

    expect(res.status).toBe(404);
  });
});

describe("GET /reservations?customerEmail=", () => {
  it("이메일의 예약 목록을 (상태 포함) 배열로 반환한다 (AC-30)", async () => {
    await request(app).post("/reservations").send({
      showtimeId: "showtime-1",
      row: "A",
      number: 1,
      customerEmail: "hoon@example.com",
    });

    const res = await request(app).get(
      "/reservations?customerEmail=hoon%40example.com",
    );

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].seatLabel).toBe("A-1");
    expect(res.body[0].status).toBe("CONFIRMED");
  });

  it("customerEmail이 없으면 400을 반환한다 (AC-31)", async () => {
    const res = await request(app).get("/reservations");

    expect(res.status).toBe(400);
  });
});
