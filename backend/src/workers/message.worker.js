const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const { MessageModel } = require('../models/messageModel');
const { Conversation } = require('../models/conversationModel');
const { emitMessageOnSend } = require('../events/emitters');
const { redisOptions } = require('../queues/redisOption');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected in worker'))
  .catch((err) => console.error('MongoDB connection error in worker:', err));

// Use environment variable for Upstash Redis URL
const redisUrl = process.env.REDIS_URL;

async function processJobWithRetry(job, maxRetries = 3) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const { messagePayload, convoId } = job.data;
      const message = await MessageModel.create(messagePayload);
      const conversation = await Conversation.findByIdAndUpdate(
        convoId,
        {
          $set: { lastMessage: message._id, lastMessageAt: messagePayload.createdAt },
        },
        { new: true }
      );
      await emitMessageOnSend({ conversation, messageData: message });
      console.log('Job done:', job.id);
      return; // Success!
    } catch (err) {
      if (
        err.code === 112 || // WriteConflict
        (err.errorLabels && err.errorLabels.includes('TransientTransactionError'))
      ) {
        attempt++;
        if (attempt < maxRetries) {
          console.warn(`Write conflict, retrying job ${job.id} (attempt ${attempt})`);
          await new Promise(res => setTimeout(res, 100 * attempt)); // backoff
          continue;
        }
      }
      console.error('Job failed:', job.id, err);
      throw err;
    }
  }
}

const messageWorker = new Worker(
  'messageQueue',
  async (job) => {
    await processJobWithRetry(job);
  },
  {
    connection: {
      ...redisOptions,
      host: undefined,
      url: redisUrl,
    },
  }
);

messageWorker.on('error', (err) => {
  console.error('Worker error:', err);
});

messageWorker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});
