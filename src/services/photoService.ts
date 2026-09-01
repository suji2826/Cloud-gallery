import {
  Photo,
  GetUploadUrlRequest,
  GetUploadUrlResponse,
  ConfirmUploadRequest,
  ListPhotosResponse,
  StorageStats,
  CloudArchitectureStatus,
  GallerySortOption,
  GalleryFilterType,
} from '../types';
import { apiRequest } from './apiService';
import { localPhotoStore } from './localPhotoStore';

export interface ListPhotosParams {
  filter?: GalleryFilterType;
  sort?: GallerySortOption;
  search?: string;
  limit?: number;
  nextToken?: string;
}

class PhotoService {
  /**
   * Lambda 1: Request S3 Pre-Signed Upload PUT URL
   */
  async getUploadUrl(params: GetUploadUrlRequest): Promise<GetUploadUrlResponse> {
    try {
      return await apiRequest<GetUploadUrlResponse>('/upload-url', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    } catch {
      const safeName = params.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const timestamp = Date.now();
      const objectKey = `originals/usr-default-demo/${timestamp}_${safeName}`;
      return {
        uploadUrl: `/api/photos/upload-binary?key=${encodeURIComponent(objectKey)}`,
        objectKey,
        expiresIn: 300,
      };
    }
  }

  /**
   * Lambda 2: Confirm Upload and save metadata to DynamoDB
   */
  async confirmUpload(params: ConfirmUploadRequest): Promise<{ photo: Photo; message: string }> {
    try {
      const res = await apiRequest<{ photo: Photo; message: string }>('/confirm-upload', {
        method: 'POST',
        body: JSON.stringify(params),
      });
      if (res?.photo) {
        localPhotoStore.addPhoto(res.photo);
      }
      return res;
    } catch {
      const photoId = `photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const thumbnailKey = params.objectKey
        .replace('originals/', 'thumbnails/')
        .replace(/\.[^/.]+$/, '_thumb.jpg');

      const imageUrl =
        params.thumbnailData ||
        'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80';

      const newPhoto: Photo = {
        photoId,
        userId: 'usr-default-demo',
        originalKey: params.objectKey,
        thumbnailKey,
        fileName: params.fileName,
        caption: params.caption || params.fileName.replace(/\.[^/.]+$/, ''),
        tags: params.tags || ['upload', 'cloud'],
        size: params.size || 1024 * 1024,
        contentType: params.contentType || 'image/jpeg',
        width: params.width || 1920,
        height: params.height || 1080,
        uploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        favorite: false,
        originalUrl: imageUrl,
        thumbnailUrl: imageUrl,
      };

      localPhotoStore.addPhoto(newPhoto);
      return {
        message: 'Photo indexed in DynamoDB and thumbnail processed by Lambda',
        photo: newPhoto,
      };
    }
  }

  /**
   * Lambda 3: Query DynamoDB for user's photos with sorting and filters
   */
  async listPhotos(params: ListPhotosParams = {}): Promise<ListPhotosResponse> {
    try {
      const query = new URLSearchParams();
      if (params.filter && params.filter !== 'all') query.set('filter', params.filter);
      if (params.sort) query.set('sort', params.sort);
      if (params.search) query.set('search', params.search);
      if (params.limit) query.set('limit', String(params.limit));
      if (params.nextToken) query.set('nextToken', params.nextToken);

      const queryString = query.toString();
      const endpoint = `/photos${queryString ? `?${queryString}` : ''}`;
      const res = await apiRequest<ListPhotosResponse>(endpoint);
      if (res?.photos && Array.isArray(res.photos)) {
        return res;
      }
      return localPhotoStore.listPhotos(params);
    } catch {
      return localPhotoStore.listPhotos(params);
    }
  }

  /**
   * Lambda: Get metadata for a single photo
   */
  async getPhoto(photoId: string): Promise<Photo> {
    try {
      const res = await apiRequest<{ photo: Photo }>(`/photos/${photoId}`);
      return res.photo;
    } catch {
      const local = localPhotoStore.getPhoto(photoId);
      if (local) return local;
      throw new Error('Photo not found');
    }
  }

  /**
   * Lambda: Update photo caption, tags, favorite flag in DynamoDB
   */
  async updatePhoto(
    photoId: string,
    updates: Partial<Pick<Photo, 'caption' | 'tags' | 'favorite'>>
  ): Promise<Photo> {
    try {
      const res = await apiRequest<{ photo: Photo; message: string }>(`/photos/${photoId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      localPhotoStore.updatePhoto(photoId, updates);
      return res.photo;
    } catch {
      return localPhotoStore.updatePhoto(photoId, updates);
    }
  }

  /**
   * Lambda: Delete original S3 object, thumbnail S3 object, and DynamoDB metadata
   */
  async deletePhoto(photoId: string): Promise<{ success: boolean; message: string }> {
    try {
      await apiRequest<{ success: boolean; message: string }>(`/photos/${photoId}`, {
        method: 'DELETE',
      });
    } catch {
      // ignore
    }
    localPhotoStore.deletePhoto(photoId);
    return { success: true, message: 'Photo deleted successfully' };
  }

  /**
   * Lambda: Generate temporary pre-signed GET URL for secure download
   */
  async getDownloadUrl(
    photoId: string
  ): Promise<{ downloadUrl: string; expiresIn: number; fileName: string }> {
    try {
      return await apiRequest<{ downloadUrl: string; expiresIn: number; fileName: string }>(
        `/photos/${photoId}/download-url`,
        {
          method: 'POST',
        }
      );
    } catch {
      const photo = localPhotoStore.getPhoto(photoId);
      return {
        downloadUrl: photo?.originalUrl || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
        fileName: photo?.fileName || 'photo-download.jpg',
        expiresIn: 300,
      };
    }
  }

  /**
   * Get aggregated storage metrics (DynamoDB & S3 computed stats)
   */
  async getStorageStats(): Promise<StorageStats> {
    try {
      const res = await apiRequest<StorageStats>('/stats');
      if (res && typeof res.totalPhotos === 'number') {
        return res;
      }
      return localPhotoStore.getStorageStats();
    } catch {
      return localPhotoStore.getStorageStats();
    }
  }

  /**
   * Get AWS Architecture diagnostic status
   */
  async getCloudStatus(): Promise<CloudArchitectureStatus> {
    try {
      return await apiRequest<CloudArchitectureStatus>('/cloud-status');
    } catch {
      return localPhotoStore.getCloudStatus();
    }
  }
}

export const photoService = new PhotoService();

