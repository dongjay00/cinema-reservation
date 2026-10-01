import {
  RESERVATION_EVENT_STREAM,
  type ReservationEventDto,
} from "@cinema/shared";
import type Redis from "ioredis";
import type { NotificationSink } from "./notification-sink";
import { parseReservationEvent } from "./parse-reservation-event";

export const WORKER_GROUP = "notifier";
export const WORKER_CONSUMER = "worker-1";

export class NotificationWorker {
  constructor(
    private readonly redis: Redis,
    private readonly sink: NotificationSink,
  ) {}

  async ensureGroup(): Promise<void> {
    try {
      await this.redis.xgroup(
        "CREATE",
        RESERVATION_EVENT_STREAM,
        WORKER_GROUP,
        "$",
        "MKSTREAM",
      );
    } catch (error) {
      const message = (error as { message?: string })?.message ?? "";
      if (!message.includes("BUSYGROUP")) {
        throw error;
      }
    }
  }

  async runOnce(): Promise<number> {
    const result = await this.redis.xreadgroup(
      "GROUP",
      WORKER_GROUP,
      WORKER_CONSUMER,
      "COUNT",
      10,
      "BLOCK",
      1000,
      "STREAMS",
      RESERVATION_EVENT_STREAM,
      ">",
    );
    if (!result) {
      return 0;
    }
    let handled = 0;
    for (const [, entries] of result) {
      for (const [id, fields] of entries) {
        try {
          const flatFields = fields ?? [];
          const payloadIndex = flatFields.indexOf("payload");
          if (payloadIndex === -1) {
            throw new Error("missing payload field");
          }
          const dto: ReservationEventDto = parseReservationEvent(
            flatFields[payloadIndex + 1],
          );
          this.sink.notify(dto);
          await this.redis.xack(RESERVATION_EVENT_STREAM, WORKER_GROUP, id);
          handled += 1;
        } catch (error) {
          // 포이즌 메시지는 ACK하지 않고 남겨 둔다 — at-least-once 유지
          // (다른 소비자가 XAUTOCLAIM 등으로 재시도 가능).
          console.error(
            `[worker] message ${id} skipped (not ACKed):`,
            error instanceof Error ? error.message : error,
          );
        }
      }
    }
    return handled;
  }

  async start(signal?: AbortSignal): Promise<void> {
    await this.ensureGroup();
    while (!signal?.aborted) {
      await this.runOnce();
    }
  }
}
