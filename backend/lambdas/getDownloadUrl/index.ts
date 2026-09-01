import { successResponse, errorResponse, getAuthUser } from '../../common/response';
import { docClient, GetCommand, PHOTOS_TABLE } from '../../common/dynamo';
import { createPresignedDownloadUrl, ORIGINALS_BUCKET } from '../../common/s3';
import { PhotoRecord } from '../../types';

/**
 * Lambda 7: getDownloadUrl
 * Trigger: API Gateway POST or GET /photos/{photoId}/download-url
 * Authorizer: Amazon Cognito User Pool JWT
 * Output: Generates temporary S3 Pre-Signed GET URL with Content-Disposition attachment header
 */
export const handler = async (event: any) => {
  try {
    const { userId } = getAuthUser(event);
    const photoId = event.pathParameters?.photoId || event.pathParameters?.id;

    if (!photoId) {
      return errorResponse('Missing photoId in request path', 400);
    }

    const result = await docClient.send(
      new GetCommand({
        TableName: PHOTOS_TABLE,
        Key: {
          userId,
          photoId,
        },
      })
    );

    if (!result.Item) {
      return errorResponse('Photo not found', 404);
    }

    const photo = result.Item as PhotoRecord;
    const disposition = `attachment; filename="${encodeURIComponent(photo.fileName || 'photo.jpg')}"`;

    // 5 minutes pre-signed GET URL
    const downloadUrl = await createPresignedDownloadUrl(
      ORIGINALS_BUCKET,
      photo.originalKey,
      300,
      disposition
    );

    return successResponse({
      downloadUrl,
      fileName: photo.fileName,
      expiresIn: 300,
    });
  } catch (err: any) {
    console.error('Error generating pre-signed download URL:', err);
    if (err.message?.includes('Unauthorized')) {
      return errorResponse('Unauthorized request', 401);
    }
    return errorResponse(err.message || 'Failed to generate download URL', 500);
  }
};
