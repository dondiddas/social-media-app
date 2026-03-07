
// If REDIS_URL is set, use it directly (for Upstash, etc.)
import { RedisOptions } from "ioredis";

export const redisOptions: RedisOptions | string =
  process.env.REDIS_URL || {
    host: process.env.REDIS_HOST || "redis",
    port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
  };


//Use "redis" as the host because it's the servi//rece name from Docker Compose.
// It acts as the hostname within the Docker network.
