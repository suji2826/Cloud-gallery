import { successResponse, errorResponse, getAuthUser } from '../../common/response';
import { createPresignedUploadUrl, ORIGINALS_BUCKET } from '../../common/s3';
import { GetUploadUrlInput } from '../../types';

const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

/**
 * Lambda 1: getUploadUrl
 * Trigger: API Gateway POST /upload-url
 * Authorizer: Firebase Authentication ID Token (Bearer JWT)
 * Output: Pre-Signed S3 PUT URL for direct browser-to-S3 binary transfer
 */
export const handler = async (event: any) => {
  try {
    const { userId } = getAuthUser(event);

    const body: GetUploadUrlInput = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : (event.body || {});
    const { fileName, contentType, size } = body;

    if (!fileName || !contentType) {
      return errorResponse('fileName and contentType are required fields', 400);
    }

    if (!ALLOWED_CONTENT_TYPES.includes(contentType.toLowerCase())) {
      return errorResponse(`Unsupported image format. Allowed: ${ALLOWED_CONTENT_TYPES.join(', ')}`, 400);
    }

    if (size && size > MAX_FILE_SIZE) {
      return errorResponse(`File size exceeds limit of ${MAX_FILE_SIZE / (1024 * 1024)} MB`, 400);
    }

    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const objectKey = `originals/${userId}/${timestamp}_${sanitizedFileName}`;

    // Generate pre-signed PUT URL valid for 5 minutes (300 seconds)
    const uploadUrl = await createPresignedUploadUrl(ORIGINALS_BUCKET, objectKey, contentType, 300);

    return successResponse({
      uploadUrl,
      objectKey,
      expiresIn: 300,
      bucket: ORIGINALS_BUCKET,
    });
  } catch (err: any) {
    console.error('Error generating pre-signed upload URL:', err);
    if (err.message?.includes('Unauthorized')) {
      return errorResponse('Unauthorized request', 401);
    }
    return errorResponse(err.message || 'Internal Server Error', 500);
  }
};
