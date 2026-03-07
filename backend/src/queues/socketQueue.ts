import { Queue } from "bullmq";
import { redisOptions } from "./redisOption";

// queues/socketQueue.ts
  connection: redisOptions as string | RedisOptions,
});
