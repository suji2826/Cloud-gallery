import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const REGION = process.env.AWS_REGION || process.env.VITE_AWS_REGION || 'us-east-1';

export const s3Client = new S3Client({ region: REGION });

export const ORIGINALS_BUCKET = process.env.ORIGINALS_BUCKET || 'cloudgallery-originals-prod';
export const THUMBNAILS_BUCKET = process.env.THUMBNAILS_BUCKET || 'cloudgallery-thumbnails-prod';
export const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN || process.env.VITE_CLOUDFRONT_URL || '';

/**
 * Generates a pre-signed S3 PUT URL allowing the client to upload binary directly to S3
 */
export async function createPresignedUploadUrl(
  bucket: string,
  key: string,
  contentType: string,
  expiresInSeconds = 300
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}

/**
 * Generates a pre-signed S3 GET URL allowing temporary direct download of original asset
 */
export async function createPresignedDownloadUrl(
  bucket: string,
  key: string,
  expiresInSeconds = 300,
  responseContentDisposition?: string
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    ...(responseContentDisposition ? { ResponseContentDisposition: responseContentDisposition } : {}),
  });

  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}

/**
 * Constructs public CloudFront CDN URL for an S3 object key
 */
export function getCloudFrontUrl(key: string): string {
  if (!CLOUDFRONT_DOMAIN) {
    return `https://${THUMBNAILS_BUCKET}.s3.amazonaws.com/${key}`;
  }
  const domain = CLOUDFRONT_DOMAIN.startsWith('http') ? CLOUDFRONT_DOMAIN : `https://${CLOUDFRONT_DOMAIN}`;
  return `${domain.replace(/\/$/, '')}/${key}`;
}
