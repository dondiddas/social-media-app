import { Queue, ConnectionOptions } from "bullmq";
import { redisOptions } from "../redisOption";

export const commentQueue = new Queue("commentQueue", {
  connection: redisOptions as ConnectionOptions,
});
