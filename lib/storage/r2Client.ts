import { S3Client } from '@aws-sdk/client-s3';

let r2ClientInstance: S3Client | null = null;

export function getR2Client(): S3Client {
  if (r2ClientInstance) {
    return r2ClientInstance;
  }

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const endpointOverride = process.env.R2_ENDPOINT;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'Missing Cloudflare R2 credentials. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY in your local .env file or run `npx vercel env pull .env` to sync your Vercel credentials.'
    );
  }

  const endpoint = endpointOverride || `https://${accountId}.r2.cloudflarestorage.com`;

  r2ClientInstance = new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return r2ClientInstance;
}

export function getR2BucketName(): string {
  if (!process.env.R2_BUCKET_NAME) {
    throw new Error('Missing R2_BUCKET_NAME in environment variables.');
  }
  return process.env.R2_BUCKET_NAME;
}
