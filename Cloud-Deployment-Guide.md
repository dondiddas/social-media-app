# Cloud Deployment Guide

This document describes the deployment architecture and step-by-step process for deploying your full-stack Social Media Web Application to the cloud.

---

## Architecture Overview
- **Frontend:** React + Vite (deployed on Vercel)
- **Backend:** Node.js/Express API server (deployed on Render)
- **File Storage:** Amazon S3 (for image uploads)
- **Database:** MongoDB Atlas (cloud database)
- **Queue/Cache:** Upstash Redis (cloud Redis)

---

## System Architecture
```
User
↓
Vercel (Frontend)
↓
Render (Backend API)
↓
MongoDB Atlas / S3 / Upstash Redis
```

---

# 1. Deploying the Frontend (Vercel)

## Step 1: Push Project to GitHub
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

## Step 2: Import Project in Vercel
1. Go to [https://vercel.com](https://vercel.com)
2. Click **Add New Project**
3. Import your GitHub repository (frontend folder)
4. Configure:
   - Framework: `Vite`
   - Build command: `npm run build` (default)
   - Output: `dist` (default)

## Step 3: Set Environment Variables
In Vercel dashboard:
```
VITE_API_URL=https://backend-url.onrender.com
```

## Step 4: Deploy
Click **Deploy**. Vercel will:
- Install dependencies
- Build the project
- Deploy to production
- Provide a public URL

---

# 2. Deploying the Backend (Render)

## Step 1: Push Backend to GitHub
```bash
git add .
git commit -m "Backend initial commit"
git push origin main
```

## Step 2: Create a New Web Service on Render
1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. Click **New Web Service**
3. Connect your GitHub repository (backend folder)
4. Set build command: `npm run build`
5. Set start command: `npm start` or `node dist/server.js`

## Step 3: Set Environment Variables
In Render dashboard, add:
```
MONGODB_URI=your-mongodb-atlas-uri
REDIS_URL=your-upstash-redis-url
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
S3_BUCKET_NAME=your-s3-bucket
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

## Step 4: Deploy
Render will build and deploy your backend, providing a public API URL.

---

# 3. Configuring S3 for File Uploads
- Create an IAM role user with AmazonS3FullAccess and IAMUserChangePassword
- Create an S3 bucket in AWS.
- Set bucket policy for public read (needed for images).\
  {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::social-imagess/*"
        }
    ]
}
- Add AWS credentials and bucket name to backend environment variables.

---

# 4. Setting Up MongoDB Atlas
- Create a free cluster at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Whitelist Render's IP or allow access from anywhere (0.0.0.0/0) for testing.
- Get the connection string and add to backend env as `MONGODB_URI`.

---

# 5. Setting Up Upstash Redis
- Go to [https://upstash.com](https://upstash.com) and create a Redis database.
- Copy the Redis URL and add to backend env as `REDIS_URL`.

---

# 6. Environment Variables Reference
| Service      | Variable Name                | Example Value                                 |
|--------------|-----------------------------|-----------------------------------------------|
| Frontend     | VITE_API_URL                | https://backend-url.onrender.com         |
| Backend      | MONGODB_URI                 | mongodb+srv://user:pass@cluster.mongodb.net   |
| Backend      | REDIS_URL                   | rediss://:password@us1.upstash.io:6379        |
| Backend      | AWS_ACCESS_KEY_ID           | AKIA...                                      |
| Backend      | AWS_SECRET_ACCESS_KEY       | ...                                          |
| Backend      | S3_BUCKET_NAME              | social-imagess                          |
| Backend      | CORS_ORIGIN                 | https://frontend-url.vercel.app          |

---

# 7. Troubleshooting
- **CORS errors:** Ensure CORS_ORIGIN matches your frontend URL in backend env.
- **Image upload issues:** Check S3 credentials and bucket policy.
- **Database connection errors:** Verify MongoDB URI and network access.
- **Redis errors:** Confirm Upstash Redis URL is correct.

---

# 8. Useful Links
- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
- [AWS S3 Docs](https://docs.aws.amazon.com/s3/index.html)
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)
- [Upstash Redis Docs](https://docs.upstash.com/)

---

# 9. BullMQ Worker on Render (Upstash Redis)

## Redis Connection (Upstash Optimized)
```js
// backend/src/queues/redisOption.js
const { Redis } = require('ioredis');
const redisUrl = process.env.REDIS_URL;
const redisOptions = {
  maxRetriesPerRequest: null, // Required for Upstash
  tls: {},                   // Required for Upstash
};
const redis = new Redis(redisUrl, redisOptions);
module.exports = { redis, redisOptions };
```

## BullMQ Worker Example
```js
// backend/src/workers/message.worker.js
const { Worker } = require('bullmq');
const { redisOptions } = require('../queues/redisOption');
const redisUrl = process.env.REDIS_URL;
const messageWorker = new Worker(
  'messageQueue',
  async (job) => {
    console.log('Processing job:', job.id);
    console.log('messagePayload:', job.data.messagePayload);
  },
  {
    connection: {
      ...redisOptions,
      host: undefined, // Upstash uses URL only
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
```

## Required Environment Variables (Render)
- `REDIS_URL` (Upstash Redis URL)

Set this in your Render dashboard under Environment > Environment Variables.
