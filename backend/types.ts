export interface PhotoRecord {
  userId: string; // Partition Key (Cognito sub)
  photoId: string; // Sort Key (photo-{uuid})
  originalKey: string; // S3 object key in originals bucket: originals/{userId}/{timestamp}_{filename}
  thumbnailKey: string; // S3 object key in thumbnails bucket: thumbnails/{userId}/{timestamp}_{filename}_thumb.jpg
  fileName: string;
  caption?: string;
  tags?: string[];
  size: number; // in bytes
  contentType: string; // e.g. image/jpeg, image/png, image/webp
  width?: number;
  height?: number;
  uploadedAt: string; // ISO 8601 string (used in GSI1)
  updatedAt: string;
  favorite: string | boolean; // 'true' | 'false' (stored as string for DynamoDB GSI partitioning) or boolean for client
  originalUrl: string;
  thumbnailUrl: string;
  status: 'PENDING_UPLOAD' | 'PROCESSING' | 'READY' | 'FAILED';
  ttl?: number; // Optional DynamoDB Time-To-Live timestamp
}

export interface GetUploadUrlInput {
  fileName: string;
  contentType: string;
  size?: number;
}

export interface ConfirmUploadInput {
  objectKey: string;
  fileName: string;
  caption?: string;
  tags?: string[];
  size: number;
  contentType: string;
  width?: number;
  height?: number;
  thumbnailData?: string;
}

export interface UpdatePhotoInput {
  caption?: string;
  tags?: string[];
  favorite?: boolean;
}
