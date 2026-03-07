import { Queue, ConnectionOptions } from "bullmq";
import { redisOptions } from "../redisOption";

export const uploadQueue = new Queue("uploadQueue", {
  connection: redisOptions as ConnectionOptions,
});
