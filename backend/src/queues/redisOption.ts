import { RedisOptions } from "ioredis";

export const redisOptions: RedisOptions = {
  host: process.env.REDIS_HOST || "redis-server", // Upstash or Docker Compose
  port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // ✅ required for BullMQ workers
};
//Use "redis" as the host because it's the service name from Docker Compose.
// It acts as the hostname within the Docker network.
