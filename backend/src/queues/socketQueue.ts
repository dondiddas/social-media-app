import { Queue, ConnectionOptions } from "bullmq";
import { redisOptions } from "./redisOption";

export const socketQueue = new Queue("socketQueue", {
  connection: redisOptions as ConnectionOptions,
});
