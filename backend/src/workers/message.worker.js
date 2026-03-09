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
const messageWorker = new Worker(
  'messageQueue',
  async (job) => {
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
    } catch (err) {
      console.error('Job failed:', job.id, err);
      throw err;
    }
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
