import { useState, useCallback, useRef } from 'react';
import { UploadQueueItem, Photo } from '../types';
import { photoService } from '../services/photoService';
import { storageService } from '../services/storageService';
import { generateClientThumbnail, getImageDimensions } from '../utils/imageUtils';
import { sanitizeFileName } from '../utils/formatters';
import { MAX_FILE_SIZE, SUPPORTED_IMAGE_TYPES } from '../config/aws-config';
import { useToast } from '../context/ToastContext';

export function useUpload(onUploadSuccess?: (photos: Photo[]) => void) {
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const abortControllersRef = useRef<{ [key: string]: AbortController }>({});
  const { success, error, warning } = useToast();

  const addFilesToQueue = useCallback((files: FileList | File[]) => {
    const newItems: UploadQueueItem[] = [];

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
        warning('Unsupported file type', `${file.name} is not a valid JPG, PNG, or WEBP image.`);
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        warning('File too large', `${file.name} exceeds the 25MB maximum upload limit.`);
        return;
      }

      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const previewUrl = URL.createObjectURL(file);

      newItems.push({
        id,
        file,
        previewUrl,
        fileName: file.name,
        caption: file.name.replace(/\.[^/.]+$/, ''),
        tags: [],
        size: file.size,
        contentType: file.type,
        progress: 0,
        status: 'queued',
      });
    });

    if (newItems.length > 0) {
      setQueue((prev) => [...prev, ...newItems]);
    }
  }, [warning]);

  const updateQueueItem = useCallback((id: string, updates: Partial<UploadQueueItem>) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    // If uploading, abort
    if (abortControllersRef.current[id]) {
      abortControllersRef.current[id].abort();
      delete abortControllersRef.current[id];
    }

    setQueue((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  const clearQueue = useCallback(() => {
    queue.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    setQueue([]);
  }, [queue]);

  const startUpload = useCallback(async () => {
    const queuedItems = queue.filter((i) => i.status === 'queued' || i.status === 'error');
    if (queuedItems.length === 0) return;

    setIsUploading(true);
    const successfullyUploadedPhotos: Photo[] = [];

    for (const item of queuedItems) {
      const abortController = new AbortController();
      abortControllersRef.current[item.id] = abortController;

      try {
        // Step 1: Request S3 Pre-Signed PUT URL via Lambda 1
        updateQueueItem(item.id, { status: 'requesting-url', progress: 10 });
        const { uploadUrl, objectKey } = await photoService.getUploadUrl({
          fileName: sanitizeFileName(item.fileName),
          contentType: item.contentType,
          size: item.size,
        });

        // Step 2: Extract dimensions & client preview
        const dimensions = await getImageDimensions(item.file);
        const thumbnailDataUrl = await generateClientThumbnail(item.file);

        // Step 3: Direct PUT to S3 Bucket using pre-signed URL
        updateQueueItem(item.id, { status: 'uploading-s3', objectKey, progress: 20 });
        await storageService.uploadToPreSignedUrl({
          uploadUrl,
          file: item.file,
          contentType: item.contentType,
          signal: abortController.signal,
          onProgress: (percent) => {
            // Scale progress from 20% to 80%
            const scaled = 20 + Math.round(percent * 0.6);
            updateQueueItem(item.id, { progress: scaled });
          },
        });

        // Step 4: Thumbnail Generation & DynamoDB Confirm Lambda 2
        updateQueueItem(item.id, { status: 'confirming', progress: 85 });
        const confirmRes = await photoService.confirmUpload({
          objectKey,
          fileName: item.fileName,
          caption: item.caption,
          tags: item.tags,
          size: item.size,
          contentType: item.contentType,
          width: dimensions.width,
          height: dimensions.height,
          thumbnailData: thumbnailDataUrl,
        });

        updateQueueItem(item.id, {
          status: 'completed',
          progress: 100,
          photoId: confirmRes.photo.photoId,
        });

        successfullyUploadedPhotos.push(confirmRes.photo);
      } catch (err: any) {
        if (err.name === 'AbortError' || err.message?.includes('canceled')) {
          updateQueueItem(item.id, { status: 'queued', progress: 0 });
        } else {
          updateQueueItem(item.id, {
            status: 'error',
            errorMessage: err.message || 'Cloud upload failed',
          });
        }
      } finally {
        delete abortControllersRef.current[item.id];
      }
    }

    setIsUploading(false);

    if (successfullyUploadedPhotos.length > 0) {
      success(
        'Upload Complete!',
        `Successfully uploaded ${successfullyUploadedPhotos.length} photo${
          successfullyUploadedPhotos.length > 1 ? 's' : ''
        } to Amazon S3 & DynamoDB.`
      );
      if (onUploadSuccess) {
        onUploadSuccess(successfullyUploadedPhotos);
      }
    }
  }, [queue, updateQueueItem, success, onUploadSuccess]);

  return {
    queue,
    isUploading,
    addFilesToQueue,
    updateQueueItem,
    removeFromQueue,
    clearQueue,
    startUpload,
  };
}
