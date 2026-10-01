import {
  RESERVATION_EVENT_STREAM,
  type ReservationEventDto,
} from "@cinema/shared";
import Redis from "ioredis";
import { afterAll, describe, expect, it } from "vitest";
import { NotificationWorker } from "../notification-worker";

class FakeRedis {
  entries: Array<[string, string[]]> = [];
  acked: string[] = [];

  async xreadgroup(): Promise<Array<
    [string, Array<[string, string[]]>]
  > | null> {
    return this.entries.length > 0
      ? [[RESERVATION_EVENT_STREAM, this.entries]]
      : null;
  }

  async xack(_stream: string, _group: string, id: string): Promise<number> {
    this.acked.push(id);
    return 1;
  }

  async xgroup(): Promise<string> {
    return "OK";
  }
}

function createdEntry(id: string): [string, string[]] {
  return [
    id,
    [
      "payload",
      JSON.stringify({
        type: "ReservationCreated" as const,
        reservationId: "res-1",
        showtimeId: "s1",
        seatRow: "A",
        seatNumber: 1,
        customerEmail: "a@b.c",
      }),
    ],
  ];
}

describe("NotificationWorker", () => {
  it("소비한 메시지를 싱크에 전달하고 ACK한다 (AC-45)", async () => {
    const notified: ReservationEventDto[] = [];
    const fake = new FakeRedis();
    fake.entries = [
      createdEntry("1-0"),
      [
        "2-0",
        [
          "payload",
          JSON.stringify({
            type: "ReservationCancelled",
            reservationId: "res-2",
            showtimeId: "s1",
            customerEmail: "a@b.c",
          }),
        ],
      ],
    ];

    const worker = new NotificationWorker(fake as unknown as Redis, {
      notify: (dto) => notified.push(dto),
    });
    const handled = await worker.runOnce();

    expect(handled).toBe(2);
    expect(fake.acked).toEqual(["1-0", "2-0"]);
    expect(notified.map((dto) => dto.type)).toEqual([
      "ReservationCreated",
      "ReservationCancelled",
    ]);
  });

  it("포이즌 메시지는 ACK하지 않고 넘어간다 (루프 보호)", async () => {
    const notified: ReservationEventDto[] = [];
    const fake = new FakeRedis();
    fake.entries = [createdEntry("1-0"), ["2-0", ["payload", "{broken-json"]]];

    const worker = new NotificationWorker(fake as unknown as Redis, {
      notify: (dto) => notified.push(dto),
    });
    const handled = await worker.runOnce();

    expect(handled).toBe(1);
    expect(fake.acked).toEqual(["1-0"]);
    expect(notified).toHaveLength(1);
  });

  it("payload 필드가 없는 메시지도 ACK하지 않고 넘어간다", async () => {
    const fake = new FakeRedis();
    fake.entries = [["3-0", ["other-field", "x"]]];

    const worker = new NotificationWorker(fake as unknown as Redis, {
      notify: () => {},
    });
    const handled = await worker.runOnce();

    expect(handled).toBe(0);
    expect(fake.acked).toEqual([]);
  });
});

const redisUrl = process.env.REDIS_URL;

describe.skipIf(!redisUrl)("NotificationWorker 실 Redis", () => {
  const redis = new Redis(redisUrl as string);

  afterAll(async () => {
    await redis.quit();
  });

  it("XADD된 이벤트를 소비해 싱크에 전달한다", async () => {
    const notified: ReservationEventDto[] = [];
    await redis.del(RESERVATION_EVENT_STREAM);

    const worker = new NotificationWorker(redis, {
      notify: (dto) => notified.push(dto),
    });
    await worker.ensureGroup();
    await redis.xadd(
      RESERVATION_EVENT_STREAM,
      "*",
      "payload",
      JSON.stringify({
        type: "ReservationCreated",
        reservationId: "res-1",
        showtimeId: "s1",
        seatRow: "A",
        seatNumber: 1,
        customerEmail: "a@b.c",
      }),
    );
    const handled = await worker.runOnce();

    expect(handled).toBe(1);
    expect(notified[0]?.type).toBe("ReservationCreated");
  });
});
