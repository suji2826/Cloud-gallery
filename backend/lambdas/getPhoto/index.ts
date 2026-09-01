import { successResponse, errorResponse, getAuthUser } from '../../common/response';
import { docClient, GetCommand, PHOTOS_TABLE } from '../../common/dynamo';
import { PhotoRecord } from '../../types';

/**
 * Lambda 4: getPhoto
 * Trigger: API Gateway GET /photos/{photoId}
 * Authorizer: Firebase Authentication ID Token (Bearer JWT)
 * Output: Retrieves single photo item from DynamoDB table
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

    return successResponse({
      photo: {
        ...photo,
        favorite: photo.favorite === 'true' || photo.favorite === true,
      },
    });
  } catch (err: any) {
    console.error('Error fetching photo from DynamoDB:', err);
    if (err.message?.includes('Unauthorized')) {
      return errorResponse('Unauthorized request', 401);
    }
    return errorResponse(err.message || 'Failed to fetch photo', 500);
  }
};
