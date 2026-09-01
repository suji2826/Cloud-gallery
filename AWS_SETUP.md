# ☁️ CloudGallery - AWS Serverless Setup Guide

This guide provides step-by-step instructions for setting up and deploying the serverless AWS backend infrastructure for **CloudGallery** using **AWS SAM** (Serverless Application Model) or **AWS CDK**.

---

## 🏗️ Architectural Overview

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

## 📋 Prerequisites

Before running the deployment, ensure you have the following installed and configured on your machine:

1. **AWS CLI** (v2+):
   ```bash
   curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
   unzip awscliv2.zip && sudo ./aws/install
   ```
2. **AWS SAM CLI**:
   ```bash
   # Linux x86_64
   wget https://github.com/aws/aws-sam-cli/releases/latest/download/aws-sam-cli-linux-x86_64.zip
   unzip aws-sam-cli-linux-x86_64.zip -d sam-installation
   sudo ./sam-installation/install
   ```
3. **Node.js 20+ & npm**:
   ```bash
   node -v # Should be >= 20.0.0
   ```
4. **Docker** (Required by SAM build to compile native Lambda binaries like Sharp in container):
   ```bash
   docker --version
   ```

---

## 🔐 IAM Credentials & Least-Privilege Setup

> ⚠️ **Important Security Rule**: Do **not** use `AdministratorAccess` for your deployment credentials.

To create a dedicated deployment IAM user or deployment role with least privilege:

1. In the **AWS IAM Console**, create a policy named `CloudGalleryDeploymentPolicy` with permissions for:
   - `cloudformation:*` (Scoped to stack `cloudgallery-*`)
   - `s3:*` (Create/Manage originals and thumbnails buckets)
   - `dynamodb:*` (Create/Manage photos metadata table)
   - `lambda:*` (Create/Manage gallery Lambdas)
   - `apigateway:*` (Create/Manage HTTP API Gateway)
   - `cognito-idp:*` (Create/Manage User Pool & App Client)
   - `cloudfront:*` (Create/Manage CDN Distribution & OAC)
   - `iam:CreateRole`, `iam:AttachRolePolicy`, `iam:PassRole` (Scoped to `cloudgallery-*` roles)

2. Configure your AWS CLI credentials locally:
   ```bash
   aws configure
   # AWS Access Key ID: [YOUR_ACCESS_KEY_ID]
   # AWS Secret Access Key: [YOUR_SECRET_ACCESS_KEY]
   # Default region name: us-east-1
   # Default output format: json
   ```

---

## 🚀 One-Command Automated Deployment

Run the included automated deployment script:

```bash
chmod +x deploy.sh
./deploy.sh
```

### What this script does automatically:
1. Validates your AWS CLI and SAM CLI configurations.
2. Compiles TypeScript Lambda functions inside Docker for ARM64/Node 20.
3. Provisions all resources via CloudFormation stack `cloudgallery-stack-prod`.
4. Retrieves all generated resource endpoints and IDs.
5. Automatically writes the production `.env` file for the React frontend.

---

## 🛠️ Manual Deployment via AWS SAM

If you prefer deploying step-by-step with AWS SAM CLI:

```bash
# 1. Build backend functions
sam build --use-container --template-file template.yaml

# 2. Guided deploy (first time)
sam deploy --guided

# When prompted:
# - Stack Name [cloudgallery-stack-prod]: cloudgallery-stack-prod
# - AWS Region [us-east-1]: us-east-1
# - Parameter Environment [prod]: prod
# - Parameter CorsAllowedOrigin [*]: *
# - Confirm changes before deploy [Y/n]: n
# - Allow SAM CLI IAM role creation [Y/n]: Y
# - Save arguments to configuration file [Y/n]: Y
```

---

## 🌐 Connecting the Frontend

After deployment finishes, copy the SAM stack outputs into your `.env` file (or let `deploy.sh` populate it automatically):

```env
# .env
VITE_AWS_REGION="us-east-1"
VITE_API_GATEWAY_URL="https://abcdef123.execute-api.us-east-1.amazonaws.com/prod"
VITE_COGNITO_USER_POOL_ID="us-east-1_example123"
VITE_COGNITO_CLIENT_ID="1234567890abcdef"
VITE_CLOUDFRONT_URL="https://d111111abcdef8.cloudfront.net"
```

Start the application:
```bash
npm run build
npm run start
```
The React frontend will immediately route all authentication through Amazon Cognito and perform direct S3 pre-signed uploads through your live API Gateway.
