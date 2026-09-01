import { successResponse, errorResponse, getAuthUser } from '../../common/response';
import { docClient, GetCommand, DeleteCommand, PHOTOS_TABLE } from '../../common/dynamo';
import { s3Client, ORIGINALS_BUCKET, THUMBNAILS_BUCKET } from '../../common/s3';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { PhotoRecord } from '../../types';

/**
 * Lambda 6: deletePhoto
 * Trigger: API Gateway DELETE /photos/{photoId}
 * Authorizer: Amazon Cognito User Pool JWT
 * Output: Deletes S3 original binary, S3 thumbnail binary, and DynamoDB metadata item
 */
export const handler = async (event: any) => {
  try {
    const { userId } = getAuthUser(event);
    const photoId = event.pathParameters?.photoId || event.pathParameters?.id;

    if (!photoId) {
      return errorResponse('Missing photoId in request path', 400);
    }

    // 1. Get photo item from DynamoDB to retrieve S3 keys
    const getResult = await docClient.send(
      new GetCommand({
        TableName: PHOTOS_TABLE,
        Key: {
          userId,
          photoId,
        },
      })
    );

    if (!getResult.Item) {
      return errorResponse('Photo not found', 404);
    }

    const photo = getResult.Item as PhotoRecord;

    // 2. Delete original object from Originals S3 Bucket
    if (photo.originalKey) {
      try {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: ORIGINALS_BUCKET,
            Key: photo.originalKey,
          })
        );
      } catch (s3Err) {
        console.warn('Could not delete original S3 object:', s3Err);
      }
    }

    // 3. Delete thumbnail object from Thumbnails S3 Bucket
    if (photo.thumbnailKey) {
      try {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: THUMBNAILS_BUCKET,
            Key: photo.thumbnailKey,
          })
        );
      } catch (s3Err) {
        console.warn('Could not delete thumbnail S3 object:', s3Err);
      }
    }

    // 4. Delete item from DynamoDB
    await docClient.send(
      new DeleteCommand({
        TableName: PHOTOS_TABLE,
        Key: {
          userId,
          photoId,
        },
      })
    );

    return successResponse({
      success: true,
      message: 'Photo deleted permanently from S3 and DynamoDB',
      photoId,
    });
  } catch (err: any) {
    console.error('Error deleting photo:', err);
    if (err.message?.includes('Unauthorized')) {
      return errorResponse('Unauthorized request', 401);
    }
    return errorResponse(err.message || 'Failed to delete photo', 500);
  }
};
