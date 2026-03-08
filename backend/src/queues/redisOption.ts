
import { ConnectionOptions } from "bullmq";

export const redisOptions: ConnectionOptions = process.env.REDIS_URL
  ? { url: process.env.REDIS_URL, maxRetriesPerRequest: null, family: 4, tls: {} }
  : {
      host: process.env.REDIS_HOST || "redis",
      port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null,
      family: 4,
      tls: {},
    };


