// backend/src/workers/message.worker.js
const { Worker } = require('bullmq');
const { redisOptions } = require('../queues/redisOption');

// Use environment variable for Upstash Redis URL
const redisUrl = process.env.REDIS_URL;

// Create BullMQ Worker for 'messageQueue'
const messageWorker = new Worker(
  'messageQueue',
  async (job) => {
    // Log the messagePayload from job data
    console.log('Processing job:', job.id);
    console.log('messagePayload:', job.data.messagePayload);
    // ...add your processing logic here...
  },
  {
    connection: {
      ...redisOptions,
      host: undefined, // Upstash uses URL only
      url: redisUrl,
    },
  }
);

// Error listener for connection or processing failures
messageWorker.on('error', (err) => {
  console.error('Worker error:', err);
});

messageWorker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});
