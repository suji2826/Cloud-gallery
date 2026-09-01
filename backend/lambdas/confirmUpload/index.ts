import { successResponse, errorResponse, getAuthUser } from '../../common/response';
import { docClient, PutCommand, PHOTOS_TABLE } from '../../common/dynamo';
import { getCloudFrontUrl, ORIGINALS_BUCKET, THUMBNAILS_BUCKET } from '../../common/s3';
import { ConfirmUploadInput, PhotoRecord } from '../../types';

/**
 * Lambda 2: confirmUpload
 * Trigger: API Gateway POST /confirm-upload
 * Authorizer: Amazon Cognito User Pool JWT
 * Output: Persists photo metadata record to Amazon DynamoDB table
 */
export const handler = async (event: any) => {
  try {
    const { userId } = getAuthUser(event);

    const body: ConfirmUploadInput = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : (event.body || {});
    const { objectKey, fileName, caption, tags, size, contentType, width, height, thumbnailData } = body;

    if (!objectKey || !fileName) {
      return errorResponse('objectKey and fileName are required fields', 400);
    }

    // Security verify: Ensure objectKey belongs to the requesting Cognito user sub
    if (!objectKey.startsWith(`originals/${userId}/`)) {
      return errorResponse('Forbidden: Object key prefix does not match authenticated user ID', 403);
    }

    const photoId = `photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const thumbnailKey = objectKey.replace('originals/', 'thumbnails/').replace(/\.[^/.]+$/, '_thumb.jpg');
    const now = new Date().toISOString();

    const originalUrl = `https://${ORIGINALS_BUCKET}.s3.amazonaws.com/${objectKey}`;
    // CloudFront CDN URL for edge distribution
    const thumbnailUrl = thumbnailData || getCloudFrontUrl(thumbnailKey);

    const photoRecord: PhotoRecord = {
      userId,
      photoId,
      originalKey: objectKey,
      thumbnailKey,
      fileName,
      caption: caption || fileName.replace(/\.[^/.]+$/, ''),
      tags: Array.isArray(tags) ? tags : [],
      size: Number(size) || 0,
      contentType: contentType || 'image/jpeg',
      width: width ? Number(width) : undefined,
      height: height ? Number(height) : undefined,
      uploadedAt: now,
      updatedAt: now,
      favorite: 'false',
      originalUrl,
      thumbnailUrl,
      status: 'READY',
    };

    await docClient.send(
      new PutCommand({
        TableName: PHOTOS_TABLE,
        Item: photoRecord,
      })
    );

    return successResponse(
      {
        message: 'Photo metadata indexed successfully in DynamoDB',
        photo: {
          ...photoRecord,
          favorite: false,
        },
      },
      201
    );
  } catch (err: any) {
    console.error('Error confirming upload in DynamoDB:', err);
    if (err.message?.includes('Unauthorized')) {
      return errorResponse('Unauthorized request', 401);
    }
    return errorResponse(err.message || 'Failed to save photo metadata', 500);
  }
};
