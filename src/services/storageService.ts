/**
 * S3 Storage Service
 * Handles direct-to-S3 binary file uploads using Pre-Signed URLs.
 * Bypasses backend web server for high performance and scalability.
 */

export interface S3UploadOptions {
  uploadUrl: string;
  file: File;
  contentType: string;
  onProgress?: (percentage: number, loadedBytes: number, totalBytes: number) => void;
  signal?: AbortSignal;
}

export class StorageService {
  /**
   * Performs direct HTTP PUT to the pre-signed S3 URL
   */
  async uploadToPreSignedUrl(options: S3UploadOptions): Promise<void> {
    const { uploadUrl, file, contentType, onProgress, signal } = options;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      if (signal) {
        signal.addEventListener('abort', () => {
          xhr.abort();
          reject(new Error('Upload canceled by user.'));
        });
      }

      xhr.open('PUT', uploadUrl, true);
      xhr.setRequestHeader('Content-Type', contentType);

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentage = Math.round((event.loaded / event.total) * 100);
            onProgress(percentage, event.loaded, event.total);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          if (onProgress) onProgress(100, file.size, file.size);
          resolve();
        } else {
          reject(
            new Error(
              `S3 upload failed with status ${xhr.status}: ${xhr.statusText || 'Access Denied / Expired Pre-Signed URL'}`
            )
          );
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error during S3 direct upload. Please check CORS & bucket permissions.'));
      };

      xhr.ontimeout = () => {
        reject(new Error('S3 upload timed out. Connection was too slow.'));
      };

      xhr.send(file);
    });
  }
}

export const storageService = new StorageService();
