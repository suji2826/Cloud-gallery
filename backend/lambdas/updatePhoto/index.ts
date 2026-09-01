import { successResponse, errorResponse, getAuthUser } from '../../common/response';
import { docClient, UpdateCommand, GetCommand, PHOTOS_TABLE } from '../../common/dynamo';
import { UpdatePhotoInput, PhotoRecord } from '../../types';

/**
 * Lambda 5: updatePhoto
 * Trigger: API Gateway PUT or PATCH /photos/{photoId}
 * Authorizer: Amazon Cognito User Pool JWT
 * Output: Updates caption, tags, or favorite flag in DynamoDB table
 */
export const handler = async (event: any) => {
  try {
    const { userId } = getAuthUser(event);
    const photoId = event.pathParameters?.photoId || event.pathParameters?.id;

    if (!photoId) {
      return errorResponse('Missing photoId in request path', 400);
    }

    const body: UpdatePhotoInput = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : (event.body || {});
    const { caption, tags, favorite } = body;

    const updateExpressions: string[] = ['#updatedAt = :updatedAt'];
    const expressionAttributeNames: Record<string, string> = {
      '#updatedAt': 'updatedAt',
    };
    const expressionAttributeValues: Record<string, any> = {
      ':updatedAt': new Date().toISOString(),
    };

    if (caption !== undefined) {
      updateExpressions.push('#caption = :caption');
      expressionAttributeNames['#caption'] = 'caption';
      expressionAttributeValues[':caption'] = caption;
    }

    if (tags !== undefined) {
      updateExpressions.push('#tags = :tags');
      expressionAttributeNames['#tags'] = 'tags';
      expressionAttributeValues[':tags'] = Array.isArray(tags) ? tags : [];
    }

    if (favorite !== undefined) {
      updateExpressions.push('#favorite = :favorite');
      expressionAttributeNames['#favorite'] = 'favorite';
      expressionAttributeValues[':favorite'] = favorite ? 'true' : 'false';
    }

    const updateResult = await docClient.send(
      new UpdateCommand({
        TableName: PHOTOS_TABLE,
        Key: {
          userId,
          photoId,
        },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      })
    );

    const updatedItem = updateResult.Attributes as PhotoRecord;

    return successResponse({
      message: 'Photo updated successfully',
      photo: {
        ...updatedItem,
        favorite: updatedItem?.favorite === 'true' || updatedItem?.favorite === true,
      },
    });
  } catch (err: any) {
    console.error('Error updating photo in DynamoDB:', err);
    if (err.message?.includes('Unauthorized')) {
      return errorResponse('Unauthorized request', 401);
    }
    return errorResponse(err.message || 'Failed to update photo', 500);
  }
};
