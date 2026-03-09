import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

console.log("[S3 DEBUG] AWS_S3_BUCKET:", process.env.AWS_S3_BUCKET);
const BUCKET = process.env.AWS_S3_BUCKET;

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

function generateS3Key(folder: string): string {
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  return `${folder}/${unique}`;
}

export async function uploadToS3(buffer: Buffer, folder: string, mimetype: string): Promise<{ url: string; key: string }> {
  const key = generateS3Key(folder);
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET!,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
  }));
  const url = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  return { url, key };
}

export async function deleteFromS3(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({
    Bucket: BUCKET!,
    Key: key,
  }));
}
