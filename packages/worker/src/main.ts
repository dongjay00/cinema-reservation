import Redis from "ioredis";
import { consoleSink } from "./notification-sink";
import { NotificationWorker } from "./notification-worker";

const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");
redis.on("error", (error) => {
  console.error("[worker] redis:", error.message);
});

const worker = new NotificationWorker(redis, consoleSink);
const controller = new AbortController();
process.on("SIGINT", () => controller.abort());
process.on("SIGTERM", () => controller.abort());

worker
  .start(controller.signal)
  .then(async () => {
    await redis.quit();
  })
  .catch(async (error) => {
    console.error("[worker] fatal:", error);
    await redis.quit();
    process.exit(1);
  });
