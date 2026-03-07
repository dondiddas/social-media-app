import AWS from 'aws-sdk';


const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

console.log("[S3 DEBUG] AWS_S3_BUCKET:", process.env.AWS_S3_BUCKET);
const BUCKET = process.env.AWS_S3_BUCKET;

function generateS3Key(folder: string): string {
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  return `${folder}/${unique}`;
}

export async function uploadToS3(buffer: Buffer, folder: string, mimetype: string): Promise<{ url: string; key: string }> {
  const key = generateS3Key(folder);
  const params = {
    Bucket: BUCKET!,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
    // ACL removed for Object Ownership enforced buckets
  };
  await s3.putObject(params).promise();
  const url = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  return { url, key };
}

export async function deleteFromS3(key: string): Promise<void> {
  const params = {
    Bucket: BUCKET!,
    Key: key,
  };
  await s3.deleteObject(params).promise();
}
