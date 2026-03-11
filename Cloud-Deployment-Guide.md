
# Cloud Deployment Guide (Modern Dockerized Setup)

This guide explains how to deploy full-stack Social Media Web Application using modern best practices: Vercel for frontend, Render for backend and workers, Amazon S3 for file storage, MongoDB Atlas for database, and Upstash Redis for queues. All backend workers are Dockerized for easy scaling and management.

---

## 1. System Architecture

```
User
↓
Vercel (Frontend)
↓
Render (Backend API & Workers)
↓
MongoDB Atlas / S3 / Upstash Redis
```

---

## 2. Frontend Deployment (Vercel)

1. Push your frontend (in the frontend/ folder) to GitHub.
2. Go to https://vercel.com and create a new project from your repo.
3. Set framework to Vite, build command to `npm run build`, and output to `dist` (defaults).
4. In Vercel dashboard, set environment variable:
   - `VITE_API_URL=https://your-backend-url.onrender.com`
5. Click Deploy. Vercel will build and host your frontend, giving you a public URL.

---

## 3. Backend & Worker Deployment (Render)

### Backend API
1. Push backend (backend/ folder) to GitHub.
2. On https://dashboard.render.com, create a new Web Service from your repo.
3. Set build command: `npm run build`
4. Set start command: `npm start` or `node dist/server.js`
5. Add environment variables:
   - `MONGODB_URI=...` (MongoDB Atlas URI)
   - `REDIS_URL=...` (Upstash Redis URL)
   - `AWS_ACCESS_KEY_ID=...`
   - `AWS_SECRET_ACCESS_KEY=...`
   - `S3_BUCKET_NAME=...`
   - `CORS_ORIGIN=https://your-frontend-url.vercel.app`
6. Deploy. Render will build and host your backend API.

### BullMQ Workers (Dockerized)
For each worker (comment, message, like):
1. Ensure you have a dedicated Dockerfile for each worker in backend/ (e.g., Dockerfile.worker, Dockerfile.messageworker, Dockerfile.likeworker).
2. On Render, create a new service for each worker:
   - Select Docker as the environment.
   - Set the Dockerfile path (e.g., backend/Dockerfile.messageworker).
   - Set the build context to backend/.
   - Set the start command to the appropriate worker (e.g., `node dist/workers/message.worker.js`).
   - Add the same environment variables as the backend API.
3. Deploy. Each worker will process jobs from its queue.

---

## 4. Cloud Services Setup

### Amazon S3 (File Storage)
- Create an S3 bucket and IAM user with AmazonS3FullAccess.
- Set a bucket policy for public read if needed for images.
- Add AWS credentials and bucket name to backend/worker environment variables.

### MongoDB Atlas (Database)
- Create a free cluster at https://www.mongodb.com/cloud/atlas
- Whitelist Render's IP or allow 0.0.0.0/0 for testing.
- Add the connection string as `MONGODB_URI`.

### Upstash Redis (Queue)
- Create a Redis database at https://upstash.com
- Add the Redis URL as `REDIS_URL`.

---

## 5. Local Development with Docker

### Build Worker Images
From the project root:
```bash
docker build -f backend/Dockerfile.worker -t comment-worker ./backend
docker build -f backend/Dockerfile.messageworker -t message-worker ./backend
docker build -f backend/Dockerfile.likeworker -t like-worker ./backend
```

### Run Worker Containers
```bash
docker run --env-file backend/.env comment-worker
docker run --env-file backend/.env message-worker
docker run --env-file backend/.env like-worker
```

---

## 6. Environment Variables Reference

| Service      | Variable Name                | Example Value                                 |
|--------------|-----------------------------|-----------------------------------------------|
| Frontend     | VITE_API_URL                | https://backend-url.onrender.com              |
| Backend/Workers | MONGODB_URI              | mongodb+srv://user:pass@cluster.mongodb.net   |
| Backend/Workers | REDIS_URL                | rediss://:password@us1.upstash.io:6379        |
| Backend/Workers | AWS_ACCESS_KEY_ID        | AKIA...                                      |
| Backend/Workers | AWS_SECRET_ACCESS_KEY    | ...                                          |
| Backend/Workers | S3_BUCKET_NAME           | social-imagess                               |
| Backend/Workers | CORS_ORIGIN              | https://frontend-url.vercel.app               |

---

## 7. Troubleshooting

- **CORS errors:** Ensure CORS_ORIGIN matches your frontend URL in backend/worker env.
- **Image upload issues:** Check S3 credentials and bucket policy.
- **Database connection errors:** Verify MongoDB URI and network access.
- **Redis errors:** Confirm Upstash Redis URL is correct.
- **Worker not processing jobs:** Check logs, environment variables, and queue names.

---

## 8. Useful Links

- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
- [AWS S3 Docs](https://docs.aws.amazon.com/s3/index.html)
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)
- [Upstash Redis Docs](https://docs.upstash.com/)

---
