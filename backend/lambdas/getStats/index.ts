import { successResponse, errorResponse, getAuthUser } from '../../common/response';
import { docClient, QueryCommand, PHOTOS_TABLE } from '../../common/dynamo';
import { PhotoRecord } from '../../types';

/**
 * Lambda 8: getStats
 * Trigger: API Gateway GET /stats
 * Authorizer: Amazon Cognito User Pool JWT
 * Output: Aggregates photo count, S3 storage used, favorite counts, and quota
 */
export const handler = async (event: any) => {
  try {
    const { userId } = getAuthUser(event);

    const result = await docClient.send(
      new QueryCommand({
        TableName: PHOTOS_TABLE,
        KeyConditionExpression: 'userId = :uid',
        ExpressionAttributeValues: {
          ':uid': userId,
        },
        ProjectionExpression: 'photoId, #sz, favorite',
        ExpressionAttributeNames: {
          '#sz': 'size',
        },
      })
    );

    const items = (result.Items || []) as Array<{ photoId: string; size?: number; favorite?: string | boolean }>;

    let totalSizeBytes = 0;
    let favoritesCount = 0;

    items.forEach((item) => {
      totalSizeBytes += Number(item.size || 0);
      if (item.favorite === 'true' || item.favorite === true) {
        favoritesCount += 1;
      }
    });

    const maxQuotaBytes = 10 * 1024 * 1024 * 1024; // 10 GB Free Tier

    const formatBytes = (bytes: number) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return successResponse({
      totalPhotos: items.length,
      totalSizeBytes,
      formattedSize: formatBytes(totalSizeBytes),
      favoritesCount,
      maxQuotaBytes,
      formattedQuota: formatBytes(maxQuotaBytes),
      quotaPercentage: Math.min(100, parseFloat(((totalSizeBytes / maxQuotaBytes) * 100).toFixed(2))),
    });
  } catch (err: any) {
    console.error('Error fetching stats:', err);
    if (err.message?.includes('Unauthorized')) {
      return errorResponse('Unauthorized request', 401);
    }
    return errorResponse(err.message || 'Failed to calculate storage stats', 500);
  }
};
