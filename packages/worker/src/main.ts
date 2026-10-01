import Redis from "ioredis";
import { consoleSink } from "./notification-sink";
import { NotificationWorker } from "./notification-worker";

const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");
const worker = new NotificationWorker(redis, consoleSink);
void worker.start();
