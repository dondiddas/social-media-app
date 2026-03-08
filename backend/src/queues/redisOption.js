// backend/src/queues/redisOption.js
const { Redis } = require('ioredis');

// Use environment variable for Upstash Redis URL
const redisUrl = process.env.REDIS_URL;

const redisOptions = {
  maxRetriesPerRequest: null, // Required for Upstash
  tls: {},                   // Required for Upstash
};

const redis = new Redis(redisUrl, redisOptions);

module.exports = { redis, redisOptions };
