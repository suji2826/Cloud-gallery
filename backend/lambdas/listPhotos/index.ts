import { successResponse, errorResponse, getAuthUser } from '../../common/response';
import { docClient, QueryCommand, PHOTOS_TABLE } from '../../common/dynamo';
import { PhotoRecord } from '../../types';

/**
 * Lambda 3: listPhotos
 * Trigger: API Gateway GET /photos
 * Authorizer: Firebase Authentication ID Token (Bearer JWT)
 * Output: Queries DynamoDB using partition key `userId` and optional GSI / FilterExpressions
 */
export const handler = async (event: any) => {
  try {
    const { userId } = getAuthUser(event);

    const queryParams = event.queryStringParameters || {};
    const { filter, search, sort, limit, nextToken } = queryParams;

    const pageSize = limit ? Math.min(parseInt(limit, 10), 100) : 50;

    // Use GSI1 (UserIdUploadedAtIndex) by default for chronological sorting
    const queryInput: any = {
      TableName: PHOTOS_TABLE,
      KeyConditionExpression: 'userId = :uid',
      ExpressionAttributeValues: {
        ':uid': userId,
      },
      ScanIndexForward: sort === 'oldest', // false = newest first (descending), true = oldest first
      Limit: pageSize,
    };

    if (nextToken) {
      try {
        queryInput.ExclusiveStartKey = JSON.parse(Buffer.from(nextToken, 'base64').toString('utf8'));
      } catch {
        // Invalid nextToken ignored
      }
    }

    // Filter by favorites if requested
    if (filter === 'favorites') {
      queryInput.FilterExpression = 'favorite = :fav';
      queryInput.ExpressionAttributeValues[':fav'] = 'true';
    } else if (filter === 'recent') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      queryInput.FilterExpression = 'uploadedAt >= :sevenDays';
      queryInput.ExpressionAttributeValues[':sevenDays'] = sevenDaysAgo;
    } else if (filter && filter.startsWith('image/')) {
      queryInput.FilterExpression = 'contentType = :cType';
      queryInput.ExpressionAttributeValues[':cType'] = filter;
    }

    const result = await docClient.send(new QueryCommand(queryInput));
    let items = (result.Items || []) as PhotoRecord[];

    // In-memory text search filtering if search term provided
    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      items = items.filter(
        (p) =>
          p.fileName?.toLowerCase().includes(q) ||
          p.caption?.toLowerCase().includes(q) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // Sort options like size or name if explicitly specified
    if (sort === 'largest') {
      items.sort((a, b) => (b.size || 0) - (a.size || 0));
    } else if (sort === 'smallest') {
      items.sort((a, b) => (a.size || 0) - (b.size || 0));
    } else if (sort === 'name-asc') {
      items.sort((a, b) => (a.caption || a.fileName).localeCompare(b.caption || b.fileName));
    } else if (sort === 'name-desc') {
      items.sort((a, b) => (b.caption || b.fileName).localeCompare(a.caption || a.fileName));
    }

    // Map boolean favorite for client JSON compatibility
    const photos = items.map((item) => ({
      ...item,
      favorite: item.favorite === 'true' || item.favorite === true,
    }));

    const responseNextToken = result.LastEvaluatedKey
      ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
      : undefined;

    return successResponse({
      photos,
      count: photos.length,
      nextToken: responseNextToken,
    });
  } catch (err: any) {
    console.error('Error listing photos from DynamoDB:', err);
    if (err.message?.includes('Unauthorized')) {
      return errorResponse('Unauthorized request', 401);
    }
    return errorResponse(err.message || 'Failed to list photos', 500);
  }
};
