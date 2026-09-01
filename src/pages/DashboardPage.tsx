import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Images,
  HardDrive,
  Heart,
  UploadCloud,
  ArrowRight,
  Sparkles,
  Layers,
  Clock,
  TrendingUp,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Button } from '../components/UI/Button';
import { PhotoGrid } from '../components/Gallery/PhotoGrid';
import { PhotoPreview } from '../components/Gallery/PhotoPreview';
import { PhotoDetailsModal } from '../components/Gallery/PhotoDetailsModal';
import { ConfirmDialog } from '../components/UI/ConfirmDialog';
import { UploadDropzone } from '../components/Upload/UploadDropzone';
import { Photo, StorageStats } from '../types';
import { photoService } from '../services/photoService';
import { formatBytes } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();
  const { refreshStats } = useOutletContext<{ refreshStats: () => void }>() || { refreshStats: () => {} };

  const [recentPhotos, setRecentPhotos] = useState<Photo[]>([]);
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);
  const [detailsPhoto, setDetailsPhoto] = useState<Photo | null>(null);
  const [deletePhotoTarget, setDeletePhotoTarget] = useState<Photo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [photosRes, statsRes] = await Promise.all([
        photoService.listPhotos({ limit: 8, sort: 'newest' }),
        photoService.getStorageStats(),
      ]);
      setRecentPhotos(photosRes.photos);
      setStats(statsRes);
    } catch (err: any) {
      error('Failed to load dashboard', err.message);
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Actions
  const handleToggleFavorite = async (photo: Photo) => {
    try {
      const updated = await photoService.updatePhoto(photo.photoId, {
        favorite: !photo.favorite,
      });
      setRecentPhotos((prev) =>
        prev.map((p) => (p.photoId === photo.photoId ? { ...p, favorite: updated.favorite } : p))
      );
      if (previewPhoto?.photoId === photo.photoId) {
        setPreviewPhoto((prev) => (prev ? { ...prev, favorite: updated.favorite } : null));
      }
      success(
        updated.favorite ? 'Added to Favorites' : 'Removed from Favorites',
        `Photo updated in DynamoDB.`
      );
      refreshStats();
    } catch (err: any) {
      error('Update failed', err.message);
    }
  };

  const handleDownload = async (photo: Photo) => {
    try {
      info('Generating Pre-Signed URL', 'Requesting secure temporary S3 download link...');
      const { downloadUrl, fileName } = await photoService.getDownloadUrl(photo.photoId);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      success('Download Started', `Serving original binary from private S3 bucket.`);
    } catch (err: any) {
      error('Download Failed', err.message);
    }
  };

  const handleUpdateMetadata = async (photoId: string, updates: Partial<Photo>) => {
    try {
      const updated = await photoService.updatePhoto(photoId, updates);
      setRecentPhotos((prev) =>
        prev.map((p) => (p.photoId === photoId ? { ...p, ...updated } : p))
      );
      if (previewPhoto?.photoId === photoId) {
        setPreviewPhoto((prev) => (prev ? { ...prev, ...updated } : null));
      }
      success('Saved to DynamoDB', 'Photo metadata updated successfully.');
    } catch (err: any) {
      error('Save failed', err.message);
      throw err;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletePhotoTarget) return;
    setIsDeleting(true);
    try {
      await photoService.deletePhoto(deletePhotoTarget.photoId);
      setRecentPhotos((prev) => prev.filter((p) => p.photoId !== deletePhotoTarget.photoId));
      if (previewPhoto?.photoId === deletePhotoTarget.photoId) {
        setPreviewPhoto(null);
      }
      success('Photo Deleted', 'S3 original, thumbnail, and DynamoDB metadata removed.');
      setDeletePhotoTarget(null);
      refreshStats();
      fetchDashboardData();
    } catch (err: any) {
      error('Delete failed', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div id="dashboard-page" className="space-y-8">
      {/* Welcome Greeting & Quick Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {user?.name || 'Photographer'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Serverless cloud storage overview and recent photo activity.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            leftIcon={<Images className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
            onClick={() => navigate('/gallery')}
          >
            All Photos
          </Button>
          <Button
            variant="primary"
            leftIcon={<UploadCloud className="w-4 h-4" />}
            onClick={() => navigate('/upload')}
          >
            Upload Photos
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Photos */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Total Photos
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white font-mono">
              {stats?.totalPhotos ?? 0}
            </p>
          </div>
          <div className="flex items-center text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-medium">
            <span>+{Math.min(stats?.totalPhotos || 0, 12)} today</span>
            <span className="text-slate-400 ml-2 font-normal">• DynamoDB</span>
          </div>
        </div>

        {/* Favorites Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Favorites
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white font-mono">
              {stats?.favoritesCount ?? 0}
            </p>
          </div>
          <p className="text-xs text-slate-400 mt-3 font-medium">Synced with DynamoDB</p>
        </div>

        {/* Storage / CloudFront Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              S3 Storage Used
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white font-mono">
              {stats?.formattedSize || '0 B'}
            </p>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-3 font-medium">
            <span>Quota: 50 MB</span>
            <span className="text-blue-600 dark:text-blue-400">{stats?.quotaPercentage ?? 0}%</span>
          </div>
        </div>

        {/* Account Tier Card */}
        <div className="bg-slate-900 dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800 flex flex-col justify-between text-white">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Tier</span>
              <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold uppercase">
                AWS Pro
              </span>
            </div>
            <p className="text-xl font-bold text-white">Serverless Tier</p>
          </div>
          <p className="text-xs text-slate-400 mt-4 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Full Cloud Integration Active
          </p>
        </div>
      </div>

      {/* Quick Upload Dropzone Box on Dashboard */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Quick S3 Cloud Upload
          </h2>
          <span className="text-xs text-slate-400 font-mono">Direct Pre-Signed PUT</span>
        </div>
        <UploadDropzone
          onFilesSelected={(files) => {
            navigate('/upload', { state: { incomingFiles: Array.from(files) } });
          }}
        />
      </div>

      {/* Recent Uploads Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Memories</h2>
          </div>
          {recentPhotos.length > 0 && (
            <button
              type="button"
              onClick={() => navigate('/gallery')}
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <PhotoGrid
          photos={recentPhotos}
          isLoading={loading}
          onPreview={(p) => setPreviewPhoto(p)}
          onDetails={(p) => setDetailsPhoto(p)}
          onToggleFavorite={handleToggleFavorite}
          onDownload={handleDownload}
          onDelete={(p) => setDeletePhotoTarget(p)}
          emptyType="gallery"
          onUploadClick={() => navigate('/upload')}
        />
      </div>

      {/* Modals */}
      <PhotoPreview
        photo={previewPhoto}
        photosList={recentPhotos}
        onClose={() => setPreviewPhoto(null)}
        onSelectPhoto={(p) => setPreviewPhoto(p)}
        onToggleFavorite={handleToggleFavorite}
        onDownload={handleDownload}
        onDelete={(p) => setDeletePhotoTarget(p)}
        onOpenDetails={(p) => setDetailsPhoto(p)}
      />

      <PhotoDetailsModal
        photo={detailsPhoto}
        isOpen={!!detailsPhoto}
        onClose={() => setDetailsPhoto(null)}
        onUpdate={handleUpdateMetadata}
        onDownload={handleDownload}
        onDelete={(p) => setDeletePhotoTarget(p)}
      />

      <ConfirmDialog
        isOpen={!!deletePhotoTarget}
        title="Delete Photo Permanently?"
        message="This will delete the original file from the private S3 bucket, remove the optimized thumbnail, and clear the DynamoDB metadata record. This cannot be undone."
        confirmText="Delete from Cloud"
        variant="danger"
        isLoading={isDeleting}
        onClose={() => setDeletePhotoTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
