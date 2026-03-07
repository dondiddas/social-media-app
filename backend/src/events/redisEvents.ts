import Redis, { RedisOptions } from "ioredis";

// 1. Define common options (required for BullMQ compatibility)
const commonOptions: RedisOptions = {
  maxRetriesPerRequest: null,
  family: 4, // Forces IPv4, helping with Cloud provider connectivity
};

// 2. Initialize connections using the URL string directly if it exists
const REDIS_URL = process.env.REDIS_URL;

const publisher = REDIS_URL 
  ? new Redis(REDIS_URL, commonOptions) 
  : new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      ...commonOptions,
    });

const subscriber = REDIS_URL 
  ? new Redis(REDIS_URL, commonOptions) 
  : new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      ...commonOptions,
    });


export class RedisEventEmitter {
  private subscriber: Redis;
  private publisher: Redis;

  constructor() {
    this.publisher = publisher;
    this.subscriber = subscriber;
  }

  // Emit event via Redis pub/sub
  async emit(eventName: string, data: any) {
    try {
      const message = JSON.stringify(data);
      await this.publisher.publish(eventName, message);
      console.log(`📡 Redis event published: ${eventName}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to publish Redis event ${eventName}:`, error);
      return false;
    }
  }

  // Listen for events via Redis pub/sub
  on(eventName: string, callback: (data: any) => void) {
    this.subscriber.subscribe(eventName);

    this.subscriber.on("message", (channel, message) => {
      if (channel === eventName) {
        try {
          const data = JSON.parse(message);
          console.log(`🔥 Redis event received: ${eventName}`);
          callback(data);
        } catch (error) {
          console.error(`💥 Failed to parse Redis event ${eventName}:`, error);
        }
      }
    });

    console.log(`📡 Subscribed to Redis event: ${eventName}`);
  }
}

export const redisEvents = new RedisEventEmitter();
