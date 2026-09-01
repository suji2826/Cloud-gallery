export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  avatarUrl?: string;
}

export interface Photo {
  userId: string;
  photoId: string;
  originalKey: string;
  thumbnailKey: string;
  fileName: string;
  caption: string;
  contentType: string;
  size: number;
  uploadedAt: string;
  updatedAt: string;
  width?: number;
  height?: number;
  favorite: boolean;
  tags: string[];
  thumbnailUrl: string;
  originalUrl?: string;
  downloadUrl?: string;
  storageClass?: string;
  s3Bucket?: string;
  cloudFrontDomain?: string;
}

export interface UploadQueueItem {
  id: string;
  file: File;
  previewUrl: string;
  fileName: string;
  caption: string;
  tags: string[];
  size: number;
  contentType: string;
  progress: number;
  status: 'queued' | 'requesting-url' | 'uploading-s3' | 'generating-thumbnail' | 'confirming' | 'completed' | 'error';
  errorMessage?: string;
  objectKey?: string;
  photoId?: string;
  width?: number;
  height?: number;
}

export interface GetUploadUrlRequest {
  fileName: string;
  contentType: string;
  size: number;
}

export interface GetUploadUrlResponse {
  uploadUrl: string;
  objectKey: string;
  expiresIn: number;
}

export interface ConfirmUploadRequest {
  objectKey: string;
  fileName: string;
  caption?: string;
  tags?: string[];
  size: number;
  contentType: string;
  width?: number;
  height?: number;
  thumbnailData?: string; // base64 or generated thumbnail preview
}

export interface ListPhotosResponse {
  photos: Photo[];
  totalCount: number;
  nextToken?: string;
}

export interface StorageStats {
  totalPhotos: number;
  totalSizeBytes: number;
  formattedSize: string;
  favoritesCount: number;
  totalTagsCount: number;
  quotaLimitBytes: number;
  quotaPercentage: number;
  formatsBreakdown: {
    format: string;
    count: number;
    sizeBytes: number;
  }[];
}

export interface CloudArchitectureStatus {
  region: string;
  isMockEmulation: boolean;
  services: {
    firebaseAuth: { status: 'healthy' | 'warning' | 'active'; projectId: string; authDomain: string };
    apiGateway: { status: 'healthy' | 'active'; endpoint: string };
    lambda: { status: 'healthy' | 'active'; functionsCount: number };
    s3Originals: { status: 'healthy' | 'active'; bucket: string; objectCount: number };
    s3Thumbnails: { status: 'healthy' | 'active'; bucket: string; objectCount: number };
    dynamoDb: { status: 'healthy' | 'active'; table: string; itemCount: number };
    cloudFront: { status: 'healthy' | 'active'; distributionDomain: string; cacheHitRatio: string };
  };
}

export type GalleryFilterType = 'all' | 'recent' | 'favorites' | 'image/jpeg' | 'image/png' | 'image/webp';

export type GallerySortOption =
  | 'newest'
  | 'oldest'
  | 'largest'
  | 'smallest'
  | 'name-asc'
  | 'name-desc';

export type GridDensity = 'compact' | 'comfortable' | 'spacious';
