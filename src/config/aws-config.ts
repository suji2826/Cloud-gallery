/**
 * AWS Serverless Configuration Layer
 * Centralizes all Cloud resource names, endpoints, and region definitions.
 */

export const AWS_CONFIG = {
  region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  
  // Amazon Cognito User Pools
  cognito: {
    userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || 'us-east-1_cloudgallery-prod',
    clientId: import.meta.env.VITE_COGNITO_CLIENT_ID || 'cloudgallery-web-app-client',
    region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  },

  // Amazon API Gateway Endpoint (uses integrated /api by default)
  apiGateway: {
    baseUrl: import.meta.env.VITE_API_GATEWAY_URL || '/api',
    timeoutMs: 30000,
  },

  // Amazon S3 Buckets
  s3: {
    originalsBucket: 'cloudgallery-originals-prod',
    thumbnailsBucket: 'cloudgallery-thumbnails-prod',
    maxFileSizeBytes: 25 * 1024 * 1024, // 25 MB
    allowedContentTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    presignedUrlExpirySeconds: 300, // 5 minutes
  },

  // Amazon DynamoDB
  dynamodb: {
    tableName: 'cloudgallery-photos-metadata',
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
