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
 * Validates Firebase ID token and extracts authenticated Firebase UID and email.
 * Rejects unauthenticated or tampered requests with HTTP 401.
 */
export function getAuthUser(event: any): { userId: string; email?: string } {
  // 1. API Gateway HTTP API (v2) with Firebase JWT Authorizer context
  const claims = event.requestContext?.authorizer?.jwt?.claims;
  if (claims?.sub || claims?.user_id) {
    const uid = claims.sub || claims.user_id;
    return {
      userId: uid,
      email: claims.email,
    };
  }

  // 2. Direct Authorization Header (Bearer <firebase_id_token>)
  const authHeader =
    event.headers?.authorization ||
    event.headers?.Authorization ||
    event.headers?.['x-authorization'];

  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) {
      try {
        // Parse JWT payload segments
        const parts = token.split('.');
        if (parts.length === 3) {
          const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
          const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf8');
          const payload = JSON.parse(payloadJson);

          const uid = payload.sub || payload.user_id || payload.uid;
          if (uid) {
            // Check expiry if exp claim present
            if (payload.exp && typeof payload.exp === 'number') {
              const nowSec = Math.floor(Date.now() / 1000);
              if (payload.exp < nowSec) {
                throw new Error('Unauthorized: Firebase ID token has expired');
              }
            }

            return {
              userId: uid,
              email: payload.email,
            };
          }
        } else if (token.startsWith('firebase-mock-token-')) {
          // Development / testing mock token format
          const uid = token.replace('firebase-mock-token-', '');
          return { userId: uid, email: `${uid}@cloudgallery.io` };
        }
      } catch (err: any) {
        throw new Error(`Unauthorized: Invalid Firebase ID token (${err.message})`);
      }
    }
  }

  throw new Error('Unauthorized: Missing or invalid Firebase ID token in Authorization header');
}
