import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Body parsers - increased limit for image base64 / binaries
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// In-Memory Cloud Store (emulates DynamoDB Table & S3 Bucket storage in full fidelity)
interface StoredPhoto {
  photoId: string;
  userId: string;
  originalKey: string;
  thumbnailKey: string;
  fileName: string;
  caption?: string;
  tags?: string[];
  size: number;
  contentType: string;
  width?: number;
  height?: number;
  uploadedAt: string;
  updatedAt: string;
  favorite: boolean;
  originalUrl: string;
  thumbnailUrl: string;
}

const dynamoDbPhotos: Map<string, StoredPhoto> = new Map();
const s3BinaryStorage: Map<string, Buffer> = new Map();

// Seed initial photo data
const seedInitialPhotos = () => {
  const samplePhotos = [
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
  ];

  samplePhotos.forEach((p) => dynamoDbPhotos.set(p.photoId, p));
};

seedInitialPhotos();

// Helper to extract Firebase user ID from Authorization Bearer token
const getUserIdFromAuthHeader = (req: express.Request): string => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
          const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf8');
          const payload = JSON.parse(payloadJson);
          const uid = payload.sub || payload.user_id || payload.uid;
          if (uid) return uid;
        }
      } catch {
        // Continue to fallback
      }
      if (token.startsWith('firebase-token-')) {
        const parts = token.split('-');
        if (parts.length >= 3) return parts[2];
      }
    }
  }
  return 'usr-default-demo';
};

// ==========================================
// API GATEWAY & LAMBDA SERVERLESS ROUTES
// ==========================================

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      apiGateway: 'active',
      lambda: 'active',
      s3: 'active',
      dynamoDb: 'active',
      firebaseAuth: 'active',
      cloudFront: 'active',
    },
  });
});

// 3. Lambda 1: Generate S3 Pre-Signed Upload URL
const handleUploadUrl = (req: express.Request, res: express.Response) => {
  const userId = getUserIdFromAuthHeader(req);
  const { fileName, contentType, size } = req.body;

  if (!fileName || !contentType) {
    return res.status(400).json({ error: 'fileName and contentType required' });
  }

  const timestamp = Date.now();
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const objectKey = `originals/${userId}/${timestamp}_${safeName}`;

  // Direct PUT target URL
  const uploadUrl = `/api/photos/upload-binary?key=${encodeURIComponent(objectKey)}&contentType=${encodeURIComponent(contentType)}`;

  res.json({
    uploadUrl,
    objectKey,
    expiresIn: 300,
    bucket: 'cloudgallery-originals-prod',
  });
};

app.post('/api/photos/upload-url', handleUploadUrl);
app.post('/api/upload-url', handleUploadUrl);

// S3 Direct Binary Receiver (Emulates S3 Pre-Signed PUT Handler)
app.put('/api/photos/upload-binary', express.raw({ type: '*/*', limit: '50mb' }), (req, res) => {
  const key = req.query.key as string;
  if (!key) {
    return res.status(400).json({ error: 'Missing object key' });
  }

  if (Buffer.isBuffer(req.body)) {
    s3BinaryStorage.set(key, req.body);
  }

  res.status(200).json({ message: 'Binary uploaded to S3 bucket successfully', key });
});

// 4. Lambda 2: S3 ObjectCreated Trigger -> Thumbnail generation & DynamoDB PutItem
const handleConfirmUpload = (req: express.Request, res: express.Response) => {
  const userId = getUserIdFromAuthHeader(req);
  const { objectKey, fileName, caption, tags, size, contentType, width, height, thumbnailData } = req.body;

  if (!objectKey || !fileName) {
    return res.status(400).json({ error: 'objectKey and fileName required' });
  }

  const photoId = `photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const thumbnailKey = objectKey.replace('originals/', 'thumbnails/').replace(/\.[^/.]+$/, '_thumb.jpg');

  // Fallback image url if thumbnailData is not present
  const originalUrl = thumbnailData || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80';
  const thumbnailUrl = thumbnailData || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=500&q=80';

  const newPhoto: StoredPhoto = {
    photoId,
    userId,
    originalKey: objectKey,
    thumbnailKey,
    fileName,
    caption: caption || fileName.replace(/\.[^/.]+$/, ''),
    tags: tags || [],
    size: size || 1024 * 1024,
    contentType: contentType || 'image/jpeg',
    width: width || 1920,
    height: height || 1080,
    uploadedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    favorite: false,
    originalUrl,
    thumbnailUrl,
  };

  dynamoDbPhotos.set(photoId, newPhoto);

  res.status(201).json({
    message: 'Photo indexed in DynamoDB and thumbnail processed by Lambda',
    photo: newPhoto,
  });
};

app.post('/api/photos/confirm', handleConfirmUpload);
app.post('/api/confirm-upload', handleConfirmUpload);

// 5. Query / List Photos (DynamoDB Query / Scan with FilterExpressions)
app.get('/api/photos', (req, res) => {
  const userId = getUserIdFromAuthHeader(req);
  const { filter, search, sort, limit, cursor } = req.query;

  let photos = Array.from(dynamoDbPhotos.values());

  // Filter by user or global demo
  photos = photos.filter((p) => p.userId === userId || p.userId === 'usr-default-demo');

  // Filter conditions
  if (filter === 'favorites') {
    photos = photos.filter((p) => p.favorite);
  } else if (filter === 'recent') {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    photos = photos.filter((p) => new Date(p.uploadedAt).getTime() > oneWeekAgo);
  } else if (typeof filter === 'string' && filter.startsWith('image/')) {
    photos = photos.filter((p) => p.contentType === filter || (filter === 'image/jpeg' && p.contentType === 'image/jpg'));
  }

  // Search
  if (typeof search === 'string' && search.trim()) {
    const q = search.toLowerCase().trim();
    photos = photos.filter(
      (p) =>
        p.fileName.toLowerCase().includes(q) ||
        (p.caption && p.caption.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }

  // Sort
  if (sort === 'oldest') {
    photos.sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime());
  } else if (sort === 'largest') {
    photos.sort((a, b) => b.size - a.size);
  } else if (sort === 'smallest') {
    photos.sort((a, b) => a.size - b.size);
  } else if (sort === 'name-asc') {
    photos.sort((a, b) => (a.caption || a.fileName).localeCompare(b.caption || b.fileName));
  } else if (sort === 'name-desc') {
    photos.sort((a, b) => (b.caption || b.fileName).localeCompare(a.caption || a.fileName));
  } else {
    // default newest
    photos.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }

  const parsedLimit = limit ? parseInt(limit as string, 10) : 50;
  const sliced = photos.slice(0, parsedLimit);

  res.json({
    photos: sliced,
    totalCount: photos.length,
    nextCursor: photos.length > parsedLimit ? 'next-token-dummy' : undefined,
  });
});

// 6. Get Single Photo Details
app.get('/api/photos/:id', (req, res) => {
  const photo = dynamoDbPhotos.get(req.params.id);
  if (!photo) {
    return res.status(404).json({ error: 'Photo not found in DynamoDB table' });
  }
  res.json({ photo });
});

// 7. Update Photo Metadata (DynamoDB UpdateItem)
const handleUpdatePhoto = (req: express.Request, res: express.Response) => {
  const photo = dynamoDbPhotos.get(req.params.id);
  if (!photo) {
    return res.status(404).json({ error: 'Photo not found in DynamoDB table' });
  }

  const { caption, tags, favorite } = req.body;
  if (caption !== undefined) photo.caption = caption;
  if (tags !== undefined) photo.tags = tags;
  if (favorite !== undefined) photo.favorite = Boolean(favorite);
  photo.updatedAt = new Date().toISOString();

  dynamoDbPhotos.set(photo.photoId, photo);

  res.json({
    message: 'Photo metadata updated in DynamoDB',
    photo,
  });
};

app.patch('/api/photos/:id', handleUpdatePhoto);
app.put('/api/photos/:id', handleUpdatePhoto);

// 8. Delete Photo (S3 DeleteObject for Original & Thumbnail + DynamoDB DeleteItem)
app.delete('/api/photos/:id', (req, res) => {
  const photo = dynamoDbPhotos.get(req.params.id);
  if (!photo) {
    return res.status(404).json({ error: 'Photo not found in DynamoDB table' });
  }

  // Remove binaries from mock S3
  s3BinaryStorage.delete(photo.originalKey);
  s3BinaryStorage.delete(photo.thumbnailKey);

  // Remove item from DynamoDB
  dynamoDbPhotos.delete(photo.photoId);

  res.json({
    message: 'Photo deleted from S3 buckets and DynamoDB metadata store',
    photoId: req.params.id,
  });
});

// 9. Generate S3 Pre-Signed GET URL for Download
const handleDownloadUrl = (req: express.Request, res: express.Response) => {
  const photo = dynamoDbPhotos.get(req.params.id);
  if (!photo) {
    return res.status(404).json({ error: 'Photo not found' });
  }

  res.json({
    downloadUrl: photo.originalUrl,
    fileName: photo.fileName,
    expiresIn: 300,
  });
};

app.get('/api/photos/:id/download', handleDownloadUrl);
app.get('/api/photos/:id/download-url', handleDownloadUrl);
app.post('/api/photos/:id/download-url', handleDownloadUrl);

// 10. Storage Stats & Analytics
app.get('/api/stats', (req, res) => {
  const userId = getUserIdFromAuthHeader(req);
  let photos = Array.from(dynamoDbPhotos.values()).filter(
    (p) => p.userId === userId || p.userId === 'usr-default-demo'
  );

  const totalBytes = photos.reduce((acc, p) => acc + p.size, 0);
  const favoritesCount = photos.filter((p) => p.favorite).length;
  const maxQuota = 10 * 1024 * 1024 * 1024; // 10 GB Free Tier

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  res.json({
    totalPhotos: photos.length,
    totalSizeBytes: totalBytes,
    formattedSize: formatBytes(totalBytes),
    favoritesCount,
    maxQuotaBytes: maxQuota,
    formattedQuota: formatBytes(maxQuota),
    quotaPercentage: Math.min(100, parseFloat(((totalBytes / maxQuota) * 100).toFixed(2))),
  });
});

// 11. Cloud Architecture Live Status
const handleCloudStatus = (req: express.Request, res: express.Response) => {
  res.json({
    region: 'us-east-1',
    pipelineHealth: 'healthy',
    activeConnections: 1,
    s3Buckets: {
      originals: { name: 'cloudgallery-originals-prod', status: 'available', encryption: 'SSE-S3' },
      thumbnails: { name: 'cloudgallery-thumbnails-prod', status: 'available', encryption: 'SSE-S3' },
    },
    dynamoDb: {
      tableName: 'cloudgallery-photos-metadata',
      status: 'ACTIVE',
      itemCount: dynamoDbPhotos.size,
    },
    lambda: {
      thumbnailFunction: 'cloudgallery-generate-thumbnail',
      runtime: 'nodejs20.x',
      memorySize: 512,
    },
    cloudFront: {
      distributionId: 'E3B0C44298FC1C',
      domainName: 'd111111abcdef8.cloudfront.net',
      status: 'Deployed',
    },
  });
};

app.get('/api/cloud/status', handleCloudStatus);
app.get('/api/cloud-status', handleCloudStatus);

// ==========================================
// VITE MIDDLEWARE & SERVER INITIALIZATION
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CloudGallery server running on http://localhost:${PORT}`);
  });
}

startServer();
