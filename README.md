# ☁️ CloudGallery – Production Serverless Cloud Photo Gallery

**CloudGallery** is a production-grade, serverless cloud photo storage and gallery application built with **React 19, TypeScript, Tailwind CSS, Express, and AWS Serverless Architecture**.

It uses **Amazon Cognito** for authentication, **Amazon API Gateway** for REST endpoints, **AWS Lambda** for compute, **Amazon S3** for dual-bucket asset storage, **Amazon DynamoDB** for sub-millisecond metadata indexing, **S3 Event Notifications** for background Sharp image processing, and **Amazon CloudFront** for global CDN delivery.

---

## 🏛️ End-to-End Serverless Architecture

```
[React SPA Frontend] 
       │
       ├── (1. Authenticate) ─────────► [Amazon Cognito User Pool]
       │                                         │
       ├── (2. Bearer JWT) ──────────────────────┼─────────────┐
       │                                         ▼             ▼
       ├── (3. Request Pre-Signed URL) ──► [API Gateway] ──► [Lambda Functions]
       │                                                       │ (PutItem/Query)
       ├── (4. Direct Binary PUT) ────► [Amazon S3 Originals]  │
       │                                         │             ▼
       │                              (s3:ObjectCreated) ──► [DynamoDB Table]
       │                                         │             ▲
       │                                         ▼             │ (Update Record)
       │                              [Thumbnail Lambda] ──────┘
       │                                         │
       │                                         ▼
       └── (5. Fetch Optimized) ◄───── [CloudFront CDN] ◄─── [Amazon S3 Thumbnails]
```

---

## 📂 Repository & Project Structure

```
├── .env.example                     # Environment variables specification
├── template.yaml                    # AWS SAM Infrastructure-as-Code specification
├── deploy.sh                        # One-command automated AWS deployment script
├── AWS_SETUP.md                     # Step-by-step AWS setup and credentials guide
├── DEPLOYMENT.md                    # In-depth production deployment and security guide
├── backend/
│   ├── common/
│   │   ├── dynamo.ts                # DynamoDB client & commands
│   │   ├── s3.ts                    # S3 pre-signed URL generator & CloudFront helper
│   │   └── response.ts              # API Gateway & Cognito claims parser
│   ├── lambdas/
│   │   ├── getUploadUrl/            # Pre-signed S3 PUT URL generation
│   │   ├── confirmUpload/           # DynamoDB metadata persistence
│   │   ├── listPhotos/              # Query with pagination, sorting & filters
│   │   ├── getPhoto/                # Single item retrieval
│   │   ├── updatePhoto/             # Metadata update
│   │   ├── deletePhoto/             # S3 & DynamoDB deletion
│   │   ├── getDownloadUrl/          # Temporary S3 GET download URL
│   │   ├── getStats/                # Storage analytics aggregator
│   │   └── generateThumbnail/       # S3 Event-triggered Sharp resize processor
│   └── types.ts                     # Shared serverless TypeScript interfaces
├── infra/
│   └── cdk-stack.ts                 # AWS CDK alternative infrastructure stack
├── src/
│   ├── components/                  # UI, Gallery, Upload, Inspector, Modal components
│   ├── config/aws-config.ts         # Centralized AWS configuration layer
│   ├── hooks/useUpload.ts           # Direct-to-S3 pre-signed upload pipeline hook
│   ├── pages/                       # Dashboard, Gallery, Upload, Favorites, Auth
│   ├── services/                    # API, Auth, S3 Storage, Photo services
│   └── types.ts                     # Frontend interfaces and data models
└── server.ts                        # Fullstack server with live emulation & Vite middleware
```

---

## ✨ Key Capabilities

- **Direct-to-S3 Pre-Signed Uploads**: Web browser streams binary files directly to private S3 buckets via time-limited Pre-Signed PUT URLs, eliminating server bottlenecks and memory limits.
- **Event-Driven Thumbnail Processing**: Automated Lambda function triggered on `s3:ObjectCreated:*` to resize images (600px width, 80% JPEG quality) and store them in a dedicated Thumbnails bucket.
- **Amazon DynamoDB Single-Table Design**: High-performance metadata store with Global Secondary Indexes (`UserIdUploadedAtIndex`, `UserIdFavoriteIndex`) supporting sub-millisecond filtering, chronological sorting, and full-text search.
- **Cognito JWT Security**: Integrated authentication with password policies, email verification, and least-privilege IAM policies. No secret access keys are ever exposed in frontend code.
- **Amazon CloudFront CDN Distribution**: Edge-cached thumbnail delivery with Origin Access Control (OAC) to keep S3 buckets private.
- **Interactive Cloud Architecture Inspector**: Real-time diagnostic monitor visualizing active connections to Cognito, API Gateway, S3, Lambda, DynamoDB, and CloudFront.
- **Clean Minimalist Design**: Modern layout, responsive grid, dark/light themes, keyboard shortcuts, zoom controls, and DynamoDB JSON inspector.

---

## 🚀 One-Command Deployment to AWS

To deploy the entire serverless infrastructure in one command:

```bash
chmod +x deploy.sh
./deploy.sh
```

The script will:
1. Compile Lambda functions inside Docker containers.
2. Deploy the CloudFormation stack via AWS SAM (`template.yaml`).
3. Retrieve API Gateway, Cognito, S3, DynamoDB, and CloudFront endpoints.
4. Auto-generate the `.env` file with live AWS resource values.

---

## 📡 API Routes Specification

| Method | Path | Description | Authorization |
| :--- | :--- | :--- | :--- |
| `POST` | `/upload-url` | Generate S3 Pre-Signed PUT Upload URL | Cognito JWT |
| `POST` | `/confirm-upload` | Persist Photo Metadata to DynamoDB | Cognito JWT |
| `GET` | `/photos` | Query Photos (with sort, filter, pagination) | Cognito JWT |
| `GET` | `/photos/{photoId}` | Get Single Photo Metadata | Cognito JWT |
| `PUT` / `PATCH` | `/photos/{photoId}` | Update Caption, Tags, Favorite Flag | Cognito JWT |
| `DELETE` | `/photos/{photoId}` | Delete S3 Objects and DynamoDB Item | Cognito JWT |
| `GET` / `POST` | `/photos/{photoId}/download-url` | Generate S3 Pre-Signed GET Download URL | Cognito JWT |
| `GET` | `/stats` | Get Storage Analytics & Quota Usage | Cognito JWT |
| `GET` | `/cloud-status` | Get AWS Architecture Pipeline Diagnostic Status | Public / Auth |

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start local server (Express backend + Vite middleware)
npm run dev

# Run TypeScript type check
npm run lint

# Build production bundle
npm run build

# Start production server
npm run start
```
