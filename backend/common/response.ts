export interface ApiResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

export const CORS_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Amz-Date, X-Api-Key, X-Amz-Security-Token',
};

export function successResponse(data: any, statusCode = 200): ApiResponse {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(data),
  };
}

export function errorResponse(message: string, statusCode = 400, details?: any): ApiResponse {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      error: message,
      statusCode,
      ...(details ? { details } : {}),
      timestamp: new Date().toISOString(),
    }),
  };
}

/**
 * Extracts userId (sub) and email from API Gateway request context (Cognito User Pool Authorizer)
 */
export function getAuthUser(event: any): { userId: string; email?: string } {
  // API Gateway HTTP API (v2) with JWT authorizer
  const claims = event.requestContext?.authorizer?.jwt?.claims;
  if (claims?.sub) {
    return {
      userId: claims.sub,
      email: claims.email,
    };
  }

  // API Gateway REST API with Cognito User Pool Authorizer
  const restClaims = event.requestContext?.authorizer?.claims;
  if (restClaims?.sub) {
    return {
      userId: restClaims.sub,
      email: restClaims.email,
    };
  }

  // Fallback for development/testing if header contains sub
  const testSub = event.headers?.['x-user-id'] || event.headers?.['x-sub'];
  if (testSub) {
    return { userId: testSub, email: event.headers?.['x-user-email'] };
  }

  throw new Error('Unauthorized: Missing valid Cognito JWT claims in request context');
}
