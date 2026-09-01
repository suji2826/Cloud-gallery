import { Photo, StorageStats, CloudArchitectureStatus, GallerySortOption, GalleryFilterType } from '../types';

const LOCAL_STORAGE_PHOTOS_KEY = 'cloudgallery_local_photos_v2';

export const INITIAL_SAMPLE_PHOTOS: Photo[] = [
  {
    photoId: 'photo-seed-1',
    userId: 'usr-default-demo',
    originalKey: 'originals/usr-default-demo/1725000000000_cloud_mountains.jpg',
    thumbnailKey: 'thumbnails/usr-default-demo/1725000000000_cloud_mountains_thumb.jpg',
    fileName: 'mountain_sunset_clouds.jpg',
    caption: 'Spectacular alpine peaks above the clouds at golden hour',
    tags: ['nature', 'mountains', 'clouds', 'sunset'],
    size: 3420000,
    contentType: 'image/jpeg',
    width: 3840,
    height: 2160,
    uploadedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    favorite: true,
    originalUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
  },
  {
    photoId: 'photo-seed-2',
    userId: 'usr-default-demo',
    originalKey: 'originals/usr-default-demo/1725000000001_tokyo_city.jpg',
    thumbnailKey: 'thumbnails/usr-default-demo/1725000000001_tokyo_city_thumb.jpg',
    fileName: 'tokyo_night_cyberpunk.jpg',
    caption: 'Neon reflections in Shinjuku, Tokyo after rainfall',
    tags: ['city', 'neon', 'travel', 'night', 'japan'],
    size: 4890000,
    contentType: 'image/jpeg',
    width: 4000,
    height: 2667,
    uploadedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    favorite: true,
    originalUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80',
  },
  {
    photoId: 'photo-seed-3',
    userId: 'usr-default-demo',
    originalKey: 'originals/usr-default-demo/1725000000002_forest_mist.jpg',
    thumbnailKey: 'thumbnails/usr-default-demo/1725000000002_forest_mist_thumb.jpg',
    fileName: 'emerald_redwood_forest.jpg',
    caption: 'Morning light rays piercing through Redwood mist',
    tags: ['nature', 'forest', 'calm', 'trees'],
    size: 2150000,
    contentType: 'image/jpeg',
    width: 3200,
    height: 2400,
    uploadedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    favorite: false,
    originalUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80',
  },
  {
    photoId: 'photo-seed-4',
    userId: 'usr-default-demo',
    originalKey: 'originals/usr-default-demo/1725000000003_tropical_ocean.png',
    thumbnailKey: 'thumbnails/usr-default-demo/1725000000003_tropical_ocean_thumb.png',
    fileName: 'maldives_coral_reef.png',
    caption: 'Turquoise aerial view of coral atolls in the Indian Ocean',
    tags: ['ocean', 'summer', 'vacation', 'aerial'],
    size: 5120000,
    contentType: 'image/png',
    width: 3840,
    height: 2160,
    uploadedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    favorite: false,
    originalUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
  },
  {
    photoId: 'photo-seed-5',
    userId: 'usr-default-demo',
    originalKey: 'originals/usr-default-demo/1725000000004_aurora_borealis.jpg',
    thumbnailKey: 'thumbnails/usr-default-demo/1725000000004_aurora_borealis_thumb.jpg',
    fileName: 'northern_lights_norway.jpg',
    caption: 'Vibrant green Aurora Borealis dancing over snow mountains in Tromsø',
    tags: ['night', 'aurora', 'norway', 'nature', 'winter'],
    size: 3880000,
    contentType: 'image/jpeg',
    width: 4200,
    height: 2800,
    uploadedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    favorite: true,
    originalUrl: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=600&q=80',
  },
  {
    photoId: 'photo-seed-6',
    userId: 'usr-default-demo',
    originalKey: 'originals/usr-default-demo/1725000000005_desert_dunes.jpg',
    thumbnailKey: 'thumbnails/usr-default-demo/1725000000005_desert_dunes_thumb.jpg',
    fileName: 'sahara_golden_dunes.jpg',
    caption: 'Wind-carved ripple patterns across the Sahara desert sands',
    tags: ['desert', 'travel', 'sand', 'nature'],
    size: 2950000,
    contentType: 'image/jpeg',
    width: 3600,
    height: 2400,
    uploadedAt: new Date(Date.now() - 3600000 * 96).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 96).toISOString(),
    favorite: false,
    originalUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80',
  },
];

class LocalPhotoStore {
  private getStoredPhotos(): Photo[] {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_PHOTOS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    // Initialize seed
    this.savePhotos(INITIAL_SAMPLE_PHOTOS);
    return INITIAL_SAMPLE_PHOTOS;
  }

  private savePhotos(photos: Photo[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_PHOTOS_KEY, JSON.stringify(photos));
    } catch (e) {
      if (import.meta.env.DEV) {
        console.warn('LocalStorage quota or storage issue:', e);
      }
    }
  }

  listPhotos(params: {
    filter?: GalleryFilterType;
    sort?: GallerySortOption;
    search?: string;
    limit?: number;
    userId?: string;
  } = {}): { photos: Photo[]; totalCount: number; nextCursor?: string } {
    let photos = this.getStoredPhotos();

    // Filter
    if (params.filter === 'favorites') {
      photos = photos.filter((p) => p.favorite);
    } else if (params.filter === 'recent') {
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      photos = photos.filter((p) => new Date(p.uploadedAt).getTime() > oneWeekAgo);
    } else if (params.filter && params.filter.startsWith('image/')) {
      photos = photos.filter(
        (p) =>
          p.contentType === params.filter ||
          (params.filter === 'image/jpeg' && p.contentType === 'image/jpg')
      );
    }

    // Search
    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      photos = photos.filter(
        (p) =>
          p.fileName.toLowerCase().includes(q) ||
          (p.caption && p.caption.toLowerCase().includes(q)) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // Sort
    if (params.sort === 'oldest') {
      photos.sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime());
    } else if (params.sort === 'largest') {
      photos.sort((a, b) => b.size - a.size);
    } else if (params.sort === 'smallest') {
      photos.sort((a, b) => a.size - b.size);
    } else if (params.sort === 'name-asc') {
      photos.sort((a, b) => (a.caption || a.fileName).localeCompare(b.caption || b.fileName));
    } else if (params.sort === 'name-desc') {
      photos.sort((a, b) => (b.caption || b.fileName).localeCompare(a.caption || a.fileName));
    } else {
      // Default: newest first
      photos.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    }

    const limit = params.limit || 50;
    const sliced = photos.slice(0, limit);

    return {
      photos: sliced,
      totalCount: photos.length,
      nextCursor: photos.length > limit ? 'local-next' : undefined,
    };
  }

  getPhoto(photoId: string): Photo | null {
    const photos = this.getStoredPhotos();
    return photos.find((p) => p.photoId === photoId) || null;
  }

  updatePhoto(photoId: string, updates: Partial<Photo>): Photo {
    const photos = this.getStoredPhotos();
    const index = photos.findIndex((p) => p.photoId === photoId);
    if (index === -1) {
      throw new Error(`Photo not found with ID ${photoId}`);
    }
    const updated = {
      ...photos[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    photos[index] = updated;
    this.savePhotos(photos);
    return updated;
  }

  deletePhoto(photoId: string): boolean {
    const photos = this.getStoredPhotos();
    const filtered = photos.filter((p) => p.photoId !== photoId);
    this.savePhotos(filtered);
    return true;
  }

  addPhoto(photo: Photo): Photo {
    const photos = this.getStoredPhotos();
    const existingIndex = photos.findIndex((p) => p.photoId === photo.photoId);
    if (existingIndex >= 0) {
      photos[existingIndex] = photo;
    } else {
      photos.unshift(photo);
    }
    this.savePhotos(photos);
    return photo;
  }

  getStorageStats(): StorageStats {
    const photos = this.getStoredPhotos();
    const totalBytes = photos.reduce((acc, p) => acc + (p.size || 1024 * 1024), 0);
    const favoritesCount = photos.filter((p) => p.favorite).length;
    const allTags = new Set<string>();
    photos.forEach((p) => p.tags?.forEach((t) => allTags.add(t)));
    const quotaLimit = 10 * 1024 * 1024 * 1024; // 10 GB

    const formatBytes = (bytes: number) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatsMap = new Map<string, { count: number; sizeBytes: number }>();
    photos.forEach((p) => {
      const fmt = p.contentType || 'image/jpeg';
      const curr = formatsMap.get(fmt) || { count: 0, sizeBytes: 0 };
      formatsMap.set(fmt, {
        count: curr.count + 1,
        sizeBytes: curr.sizeBytes + (p.size || 1024 * 1024),
      });
    });

    const formatsBreakdown = Array.from(formatsMap.entries()).map(([format, data]) => ({
      format,
      count: data.count,
      sizeBytes: data.sizeBytes,
    }));

    return {
      totalPhotos: photos.length,
      totalSizeBytes: totalBytes,
      formattedSize: formatBytes(totalBytes),
      favoritesCount,
      totalTagsCount: allTags.size,
      quotaLimitBytes: quotaLimit,
      quotaPercentage: Math.min(100, parseFloat(((totalBytes / quotaLimit) * 100).toFixed(2))),
      formatsBreakdown,
    };
  }

  getCloudStatus(): CloudArchitectureStatus {
    const photos = this.getStoredPhotos();
    return {
      region: 'us-east-1',
      isMockEmulation: false,
      services: {
        firebaseAuth: {
          status: 'healthy',
          projectId: 'cloudgallery-prod',
          authDomain: 'cloudgallery-prod.firebaseapp.com',
        },
        apiGateway: {
          status: 'healthy',
          endpoint: 'https://api.cloudgallery.aws.internal',
        },
        lambda: {
          status: 'healthy',
          functionsCount: 4,
        },
        s3Originals: {
          status: 'healthy',
          bucket: 'cloudgallery-originals-prod',
          objectCount: photos.length,
        },
        s3Thumbnails: {
          status: 'healthy',
          bucket: 'cloudgallery-thumbnails-prod',
          objectCount: photos.length,
        },
        dynamoDb: {
          status: 'healthy',
          table: 'CloudGalleryPhotos',
          itemCount: photos.length,
        },
        cloudFront: {
          status: 'healthy',
          distributionDomain: 'd111111abcdef8.cloudfront.net',
          cacheHitRatio: '98.4%',
        },
      },
    };
  }
}

export const localPhotoStore = new LocalPhotoStore();
