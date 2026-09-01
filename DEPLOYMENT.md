# 🚀 CloudGallery - Serverless Production Deployment Guide

This document details the production architecture, security specifications, IAM permission matrix, and maintenance workflows for the CloudGallery serverless stack.

---

## 🏛️ Production Architecture Specifications

### 1. Amazon Cognito User Pool
- **User Pool ID**: `cloudgallery-user-pool-prod`
- **Sign-in Flow**: Email-based authentication with self-signup and password policy enforcement (minimum 8 characters, uppercase, lowercase, numbers).
- **Public App Client**: `cloudgallery-web-client-prod` (No client secret generated to ensure compatibility with client-side SPAs).
- **Token Format**: Standard OIDC/JWT ID & Access tokens passed in `Authorization: Bearer <JWT>` headers to API Gateway.

### 2. API Gateway HTTP API (v2)
- **CORS Setup**:
  - `AllowOrigins`: `*` (or your production custom domain)
  - `AllowMethods`: `GET, POST, PUT, PATCH, DELETE, OPTIONS`
  - `AllowHeaders`: `Content-Type, Authorization, X-Amz-Date, X-Api-Key, X-Amz-Security-Token`
  - `MaxAge`: `3600` (1 hour preflight cache)
- **Authorization**: Integrated Cognito JWT Authorizer validating token audience and issuer against the User Pool.

### 3. Amazon S3 Dual-Bucket Strategy
- **Originals Storage Bucket (`cloudgallery-originals-prod-<AccountId>`)**:
  - Direct binary upload destination via Pre-Signed PUT URLs.
  - Server-Side Encryption: SSE-S3 (AES256).
  - Public Access Block: `BLOCK_ALL` (Private bucket).
  - CORS rules configured to allow browser `PUT` operations directly from the web client.
  - Lifecycle rule: Automatically abort incomplete multipart uploads after 24 hours.
- **Thumbnails Storage Bucket (`cloudgallery-thumbnails-prod-<AccountId>`)**:
  - Houses resized, web-optimized JPEG thumbnails.
  - Public Access Block: `BLOCK_ALL`.
  - Origin Access Control (OAC): Read permissions restricted exclusively to the CloudFront CDN service principal.

### 4. Event-Driven Lambda Thumbnail Generator
- **Trigger**: S3 Event Notification on `s3:ObjectCreated:*` with prefix `originals/`.
- **Processing**:
  1. Stream image binary from S3 Originals bucket.
  2. Resize image to maximum width 600px maintaining aspect ratio with 80% JPEG quality compression.
  3. Upload thumbnail to S3 Thumbnails bucket under `thumbnails/<userId>/<filename>_thumb.jpg`.
  4. Query DynamoDB using `userId` and update the photo metadata with `thumbnailKey`, `thumbnailUrl`, and status `READY`.
- **Runtime**: Node.js 20.x on AWS Graviton (ARM64) for maximum price/performance.

### 5. Amazon DynamoDB Single-Table Schema
- **Table Name**: `cloudgallery-photos-metadata-prod`
- **Billing Mode**: `PAY_PER_REQUEST` (On-Demand capacity).
- **Primary Key**:
  - Partition Key (`PK`): `userId` (String) - Cognito User Sub.
  - Sort Key (`SK`): `photoId` (String) - `photo-<timestamp>-<uuid>`.
- **Global Secondary Indexes (GSIs)**:
  - `GSI1 (UserIdUploadedAtIndex)`: Partition Key: `userId`, Sort Key: `uploadedAt` (Enables chronological sorting & pagination).
  - `GSI2 (UserIdFavoriteIndex)`: Partition Key: `userId`, Sort Key: `favorite` (Enables fast querying of favorite photos).
- **Features**: Point-in-time recovery (PITR) enabled; AWS Managed SSE encryption.

### 6. Amazon CloudFront CDN
- **Origin**: S3 Thumbnails Bucket with Origin Access Control (OAC).
- **Cache Policy**: `Managed-CachingOptimized` (Automatic Gzip/Brotli compression, 24-hour default TTL).
- **Viewer Protocol**: Redirect HTTP to HTTPS (`TLSv1.2_2021` security policy).

---

## 🔒 Least-Privilege IAM Permission Matrix

| Lambda Function | AWS Service | Permitted Actions | Scoped Resource ARN |
| :--- | :--- | :--- | :--- |
| **GetUploadUrlFunction** | Amazon S3 | `s3:PutObject` | `arn:aws:s3:::cloudgallery-originals-*/*` |
| **ConfirmUploadFunction** | Amazon DynamoDB | `dynamodb:PutItem`, `dynamodb:GetItem` | `arn:aws:dynamodb:*:*:table/cloudgallery-photos-metadata-*` |
| **ListPhotosFunction** | Amazon DynamoDB | `dynamodb:Query`, `dynamodb:Scan` | `arn:aws:dynamodb:*:*:table/cloudgallery-photos-metadata-*` & indexes |
| **GetPhotoFunction** | Amazon DynamoDB | `dynamodb:GetItem` | `arn:aws:dynamodb:*:*:table/cloudgallery-photos-metadata-*` |
| **UpdatePhotoFunction** | Amazon DynamoDB | `dynamodb:UpdateItem`, `dynamodb:GetItem` | `arn:aws:dynamodb:*:*:table/cloudgallery-photos-metadata-*` |
| **DeletePhotoFunction** | S3 & DynamoDB | `s3:DeleteObject`, `dynamodb:DeleteItem` | S3 Buckets & DynamoDB Table ARNs |
| **GetDownloadUrlFunction** | Amazon S3 | `s3:GetObject` | `arn:aws:s3:::cloudgallery-originals-*/*` |
| **GetStatsFunction** | Amazon DynamoDB | `dynamodb:Query` | `arn:aws:dynamodb:*:*:table/cloudgallery-photos-metadata-*` |
| **GenerateThumbnailFunction** | S3 & DynamoDB | `s3:GetObject`, `s3:PutObject`, `dynamodb:UpdateItem` | Originals/Thumbnails Buckets & DynamoDB Table |

---

## 🔄 Deployment Validation & Health Check

After running `./deploy.sh`:

1. **Verify API Gateway Health**:
   ```bash
   curl -X GET "${API_GATEWAY_URL}/api/health"
   ```
2. **Verify S3 CORS Configuration**:
   ```bash
   aws s3api get-bucket-cors --bucket "${ORIGINALS_BUCKET}"
   ```
3. **Verify DynamoDB Table Status**:
   ```bash
   aws dynamodb describe-table --table-name "${PHOTOS_TABLE}" --query "Table.TableStatus"
   ```
4. **Verify CloudFront Status**:
   ```bash
   aws cloudfront get-distribution --id "${CLOUDFRONT_DIST_ID}" --query "Distribution.Status"
   ```

---

## 🛠️ Troubleshooting

### S3 Direct Upload `403 Forbidden` / CORS Error
- Ensure the S3 bucket's CORS policy includes `PUT` and `POST` methods from `*` or your frontend origin.
- Check that the pre-signed URL has not expired (default validity is 300 seconds).
- Ensure the `Content-Type` header passed by the browser in the `PUT` request matches the exact `contentType` requested in the `getUploadUrl` call.

### Cognito JWT `401 Unauthorized`
- Verify that your API Gateway authorizer issuer string exactly matches `https://cognito-idp.<region>.amazonaws.com/<userPoolId>`.
- Check that the JWT token is sent as `Authorization: Bearer <token>`.
