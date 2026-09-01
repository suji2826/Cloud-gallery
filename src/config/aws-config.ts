/**
 * AWS Serverless Configuration Layer
 * Centralizes all Cloud resource names, endpoints, and region definitions.
 */

/**
 * Cloud Infrastructure Configuration Layer
 * Hybrid Cloud Architecture: Firebase Authentication + AWS Serverless Storage & Metadata
 */

export const AWS_CONFIG = {
  region: import.meta.env.VITE_AWS_REGION || 'us-east-1',

  // Amazon API Gateway Endpoint
  apiGateway: {
    baseUrl: import.meta.env.VITE_API_GATEWAY_URL || '/api',
    timeoutMs: 30000,
  },

  // Amazon S3 Buckets
  s3: {
    originalsBucket: import.meta.env.VITE_ORIGINALS_BUCKET || 'cloudgallery-originals-prod',
    thumbnailsBucket: import.meta.env.VITE_THUMBNAILS_BUCKET || 'cloudgallery-thumbnails-prod',
    maxFileSizeBytes: 25 * 1024 * 1024, // 25 MB
    allowedContentTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    presignedUrlExpirySeconds: 300, // 5 minutes
  },

  // Amazon DynamoDB
  dynamodb: {
    tableName: import.meta.env.VITE_DYNAMODB_TABLE || 'CloudGalleryPhotos',
    primaryKey: 'userId',
    sortKey: 'photoId',
  },

  // Amazon CloudFront CDN
  cloudFront: {
    distributionDomain: import.meta.env.VITE_CLOUDFRONT_URL || '/api/cloudfront',
    cdnEnabled: true,
  },
};

export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
export const MAX_BATCH_UPLOAD = 10;
