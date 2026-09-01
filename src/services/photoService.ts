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
    return apiRequest<GetUploadUrlResponse>('/upload-url', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * Lambda 2: Confirm Upload and save metadata to DynamoDB
   */
  async confirmUpload(params: ConfirmUploadRequest): Promise<{ photo: Photo; message: string }> {
    return apiRequest<{ photo: Photo; message: string }>('/confirm-upload', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * Lambda 3: Query DynamoDB for user's photos with sorting and filters
   */
  async listPhotos(params: ListPhotosParams = {}): Promise<ListPhotosResponse> {
    const query = new URLSearchParams();
    if (params.filter && params.filter !== 'all') query.set('filter', params.filter);
    if (params.sort) query.set('sort', params.sort);
    if (params.search) query.set('search', params.search);
    if (params.limit) query.set('limit', String(params.limit));
    if (params.nextToken) query.set('nextToken', params.nextToken);

    const queryString = query.toString();
    const endpoint = `/photos${queryString ? `?${queryString}` : ''}`;
    return apiRequest<ListPhotosResponse>(endpoint);
  }

  /**
   * Lambda: Get metadata for a single photo
   */
  async getPhoto(photoId: string): Promise<Photo> {
    const res = await apiRequest<{ photo: Photo }>(`/photos/${photoId}`);
    return res.photo;
  }

  /**
   * Lambda: Update photo caption, tags, favorite flag in DynamoDB
   */
  async updatePhoto(
    photoId: string,
    updates: Partial<Pick<Photo, 'caption' | 'tags' | 'favorite'>>
  ): Promise<Photo> {
    const res = await apiRequest<{ photo: Photo; message: string }>(`/photos/${photoId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return res.photo;
  }

  /**
   * Lambda: Delete original S3 object, thumbnail S3 object, and DynamoDB metadata
   */
  async deletePhoto(photoId: string): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>(`/photos/${photoId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Lambda: Generate temporary pre-signed GET URL for secure download
   */
  async getDownloadUrl(photoId: string): Promise<{ downloadUrl: string; expiresIn: number; fileName: string }> {
    return apiRequest<{ downloadUrl: string; expiresIn: number; fileName: string }>(
      `/photos/${photoId}/download-url`,
      {
        method: 'POST',
      }
    );
  }

  /**
   * Get aggregated storage metrics (DynamoDB & S3 computed stats)
   */
  async getStorageStats(): Promise<StorageStats> {
    return apiRequest<StorageStats>('/stats');
  }

  /**
   * Get AWS Architecture diagnostic status
   */
  async getCloudStatus(): Promise<CloudArchitectureStatus> {
    return apiRequest<CloudArchitectureStatus>('/cloud-status');
  }
}

export const photoService = new PhotoService();
