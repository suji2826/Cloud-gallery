import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3notifications from 'aws-cdk-lib/aws-s3-notifications';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigw_integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as apigw_authorizers from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class CloudGalleryStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. Amazon Cognito User Pool & App Client
    const userPool = new cognito.UserPool(this, 'CloudGalleryUserPool', {
      userPoolName: 'cloudgallery-user-pool',
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'CloudGalleryUserPoolClient', {
      userPool,
      userPoolClientName: 'cloudgallery-web-client',
      generateSecret: false, // Public SPA client
      authFlows: {
        userSrp: true,
        userPassword: true,
      },
      preventUserExistenceErrors: true,
    });

    // 2. S3 Buckets (Originals & Thumbnails)
    const originalsBucket = new s3.Bucket(this, 'OriginalsBucket', {
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST, s3.HttpMethods.HEAD],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
          maxAge: 3600,
        },
      ],
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const thumbnailsBucket = new s3.Bucket(this, 'ThumbnailsBucket', {
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // 3. Amazon CloudFront CDN with S3 Origin Access Control
    const distribution = new cloudfront.Distribution(this, 'ThumbnailsCloudFrontDistribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(thumbnailsBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachedMethods: cloudfront.CachedMethods.ALLOW_GET_HEAD,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      comment: 'CloudGallery Thumbnails CDN Edge Distribution',
    });

    // 4. Amazon DynamoDB Single Table
    const photosTable = new dynamodb.Table(this, 'PhotosMetadataTable', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'photoId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    photosTable.addGlobalSecondaryIndex({
      indexName: 'UserIdUploadedAtIndex',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'uploadedAt', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    photosTable.addGlobalSecondaryIndex({
      indexName: 'UserIdFavoriteIndex',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'favorite', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // 5. Common Lambda Environment
    const commonEnvironment = {
      PHOTOS_TABLE: photosTable.tableName,
      ORIGINALS_BUCKET: originalsBucket.bucketName,
      THUMBNAILS_BUCKET: thumbnailsBucket.bucketName,
      CLOUDFRONT_DOMAIN: distribution.distributionDomainName,
      NODE_OPTIONS: '--enable-source-maps',
    };

    // 6. Lambda Functions (Least-Privilege)
    const getUploadUrlFn = new lambda.Function(this, 'GetUploadUrlFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('backend/lambdas/getUploadUrl'),
      environment: commonEnvironment,
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
    });
    originalsBucket.grantPut(getUploadUrlFn);

    const confirmUploadFn = new lambda.Function(this, 'ConfirmUploadFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('backend/lambdas/confirmUpload'),
      environment: commonEnvironment,
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
    });
    photosTable.grantWriteData(confirmUploadFn);
    photosTable.grantReadData(confirmUploadFn);

    const listPhotosFn = new lambda.Function(this, 'ListPhotosFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('backend/lambdas/listPhotos'),
      environment: commonEnvironment,
      timeout: cdk.Duration.seconds(15),
      memorySize: 256,
    });
    photosTable.grantReadData(listPhotosFn);

    const getPhotoFn = new lambda.Function(this, 'GetPhotoFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('backend/lambdas/getPhoto'),
      environment: commonEnvironment,
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
    });
    photosTable.grantReadData(getPhotoFn);

    const updatePhotoFn = new lambda.Function(this, 'UpdatePhotoFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('backend/lambdas/updatePhoto'),
      environment: commonEnvironment,
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
    });
    photosTable.grantReadWriteData(updatePhotoFn);

    const deletePhotoFn = new lambda.Function(this, 'DeletePhotoFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('backend/lambdas/deletePhoto'),
      environment: commonEnvironment,
      timeout: cdk.Duration.seconds(15),
      memorySize: 256,
    });
    originalsBucket.grantDelete(deletePhotoFn);
    thumbnailsBucket.grantDelete(deletePhotoFn);
    photosTable.grantWriteData(deletePhotoFn);
    photosTable.grantReadData(deletePhotoFn);

    const getDownloadUrlFn = new lambda.Function(this, 'GetDownloadUrlFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('backend/lambdas/getDownloadUrl'),
      environment: commonEnvironment,
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
    });
    originalsBucket.grantRead(getDownloadUrlFn);
    photosTable.grantReadData(getDownloadUrlFn);

    const getStatsFn = new lambda.Function(this, 'GetStatsFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('backend/lambdas/getStats'),
      environment: commonEnvironment,
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
    });
    photosTable.grantReadData(getStatsFn);

    // 7. S3 Event Triggered Thumbnail Processor Lambda
    const generateThumbnailFn = new lambda.Function(this, 'GenerateThumbnailFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('backend/lambdas/generateThumbnail'),
      environment: commonEnvironment,
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
    });
    originalsBucket.grantRead(generateThumbnailFn);
    thumbnailsBucket.grantWrite(generateThumbnailFn);
    photosTable.grantReadWriteData(generateThumbnailFn);

    // S3 ObjectCreated event notification trigger
    originalsBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3notifications.LambdaDestination(generateThumbnailFn),
      { prefix: 'originals/' }
    );

    // 8. API Gateway HTTP API with Cognito JWT Authorizer
    const httpApi = new apigatewayv2.HttpApi(this, 'CloudGalleryHttpApi', {
      apiName: 'cloudgallery-http-api',
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [
          apigatewayv2.CorsHttpMethod.GET,
          apigatewayv2.CorsHttpMethod.POST,
          apigatewayv2.CorsHttpMethod.PUT,
          apigatewayv2.CorsHttpMethod.PATCH,
          apigatewayv2.CorsHttpMethod.DELETE,
          apigatewayv2.CorsHttpMethod.OPTIONS,
        ],
        allowHeaders: ['Content-Type', 'Authorization', 'X-Amz-Date', 'X-Api-Key', 'X-Amz-Security-Token'],
        maxAge: cdk.Duration.hours(1),
      },
    });

    const authorizer = new apigw_authorizers.HttpUserPoolAuthorizer(
      'CognitoAuthorizer',
      userPool,
      {
        userPoolClients: [userPoolClient],
        identitySource: ['$request.header.Authorization'],
      }
    );

    // Register HTTP API Routes
    httpApi.addRoutes({
      path: '/upload-url',
      methods: [apigatewayv2.HttpMethod.POST],
      integration: new apigw_integrations.HttpLambdaIntegration('UploadUrlIntegration', getUploadUrlFn),
      authorizer,
    });

    httpApi.addRoutes({
      path: '/confirm-upload',
      methods: [apigatewayv2.HttpMethod.POST],
      integration: new apigw_integrations.HttpLambdaIntegration('ConfirmUploadIntegration', confirmUploadFn),
      authorizer,
    });

    httpApi.addRoutes({
      path: '/photos',
      methods: [apigatewayv2.HttpMethod.GET],
      integration: new apigw_integrations.HttpLambdaIntegration('ListPhotosIntegration', listPhotosFn),
      authorizer,
    });

    httpApi.addRoutes({
      path: '/photos/{photoId}',
      methods: [apigatewayv2.HttpMethod.GET],
      integration: new apigw_integrations.HttpLambdaIntegration('GetPhotoIntegration', getPhotoFn),
      authorizer,
    });

    httpApi.addRoutes({
      path: '/photos/{photoId}',
      methods: [apigatewayv2.HttpMethod.PUT, apigatewayv2.HttpMethod.PATCH],
      integration: new apigw_integrations.HttpLambdaIntegration('UpdatePhotoIntegration', updatePhotoFn),
      authorizer,
    });

    httpApi.addRoutes({
      path: '/photos/{photoId}',
      methods: [apigatewayv2.HttpMethod.DELETE],
      integration: new apigw_integrations.HttpLambdaIntegration('DeletePhotoIntegration', deletePhotoFn),
      authorizer,
    });

    httpApi.addRoutes({
      path: '/photos/{photoId}/download-url',
      methods: [apigatewayv2.HttpMethod.POST, apigatewayv2.HttpMethod.GET],
      integration: new apigw_integrations.HttpLambdaIntegration('DownloadUrlIntegration', getDownloadUrlFn),
      authorizer,
    });

    httpApi.addRoutes({
      path: '/stats',
      methods: [apigatewayv2.HttpMethod.GET],
      integration: new apigw_integrations.HttpLambdaIntegration('StatsIntegration', getStatsFn),
      authorizer,
    });

    // 9. Stack CloudFormation Outputs
    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: httpApi.url || '',
      description: 'Production API Gateway Endpoint URL',
    });

    new cdk.CfnOutput(this, 'CognitoUserPoolId', {
      value: userPool.userPoolId,
      description: 'Cognito User Pool ID',
    });

    new cdk.CfnOutput(this, 'CognitoAppClientId', {
      value: userPoolClient.userPoolClientId,
      description: 'Cognito App Client ID',
    });

    new cdk.CfnOutput(this, 'OriginalsBucketName', {
      value: originalsBucket.bucketName,
      description: 'Originals S3 Bucket Name',
    });

    new cdk.CfnOutput(this, 'ThumbnailsBucketName', {
      value: thumbnailsBucket.bucketName,
      description: 'Thumbnails S3 Bucket Name',
    });

    new cdk.CfnOutput(this, 'DynamoDbTableName', {
      value: photosTable.tableName,
      description: 'DynamoDB Photos Metadata Table Name',
    });

    new cdk.CfnOutput(this, 'CloudFrontUrl', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'CloudFront CDN Domain URL',
    });
  }
}
