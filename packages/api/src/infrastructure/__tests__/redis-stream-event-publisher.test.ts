import { RESERVATION_EVENT_STREAM } from "@cinema/shared";
import Redis from "ioredis";
import { afterAll, describe, expect, it } from "vitest";
import { ReservationCancelled, ReservationCreated } from "../../domain/events";
import { Seat } from "../../domain/seat";
import {
  RedisStreamEventPublisher,
  toReservationEventDto,
} from "../redis-stream-event-publisher";

const redisUrl = process.env.REDIS_URL;

describe("toReservationEventDto", () => {
  it("ReservationCreated를 shared DTO로 변환한다", () => {
    const event = new ReservationCreated(
      "res-1",
      "showtime-1",
      new Seat("A", 1),
      "hoon@example.com",
    );
    expect(toReservationEventDto(event)).toEqual({
      type: "ReservationCreated",
      reservationId: "res-1",
      showtimeId: "showtime-1",
      seatRow: "A",
      seatNumber: 1,
      customerEmail: "hoon@example.com",
    });
  });

  it("ReservationCancelled를 shared DTO로 변환한다", () => {
    const event = new ReservationCancelled("res-1", "hoon@example.com");
    expect(toReservationEventDto(event)).toEqual({
      type: "ReservationCancelled",
      reservationId: "res-1",
      customerEmail: "hoon@example.com",
    });
  });
});

describe.skipIf(!redisUrl)("RedisStreamEventPublisher", () => {
  const redis = new Redis(redisUrl!);

  afterAll(async () => {
    await redis.quit();
  });

  it("이벤트를 스트림에 XADD로 발행한다 (AC-44)", async () => {
    const publisher = new RedisStreamEventPublisher(redis);
    await redis.del(RESERVATION_EVENT_STREAM);

    await publisher.publish([
      new ReservationCreated(
        "res-1",
        "showtime-1",
        new Seat("A", 1),
        "hoon@example.com",
      ),
    ]);

    expect(await redis.xlen(RESERVATION_EVENT_STREAM)).toBe(1);
    const [, fields] = (
      await redis.xrevrange(RESERVATION_EVENT_STREAM, "+", "-", "COUNT", 1)
    )[0];

    const payloadIndex = fields.indexOf("payload");
    const payload = JSON.parse(fields[payloadIndex + 1]);
    expect(payload).toMatchObject({
      type: "ReservationCreated",
      reservationId: "res-1",
    });
  });
});
