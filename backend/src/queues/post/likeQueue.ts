// queues/postQueue.ts
import { Queue, ConnectionOptions } from "bullmq";
import { redisOptions } from "../redisOption";

export const likeQueue = new Queue("likeQueue", { connection: redisOptions });
