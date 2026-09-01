import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Heart, RefreshCw } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { PhotoGrid } from '../components/Gallery/PhotoGrid';
import { PhotoPreview } from '../components/Gallery/PhotoPreview';
import { PhotoDetailsModal } from '../components/Gallery/PhotoDetailsModal';
import { ConfirmDialog } from '../components/UI/ConfirmDialog';
import { Photo } from '../types';
import { photoService } from '../services/photoService';
import { useToast } from '../context/ToastContext';

export const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error, info } = useToast();
  const { refreshStats } = useOutletContext<{ refreshStats: () => void }>() || { refreshStats: () => {} };

  const [favoritePhotos, setFavoritePhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);
  const [detailsPhoto, setDetailsPhoto] = useState<Photo | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Photo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const res = await photoService.listPhotos({ filter: 'favorites' });
      setFavoritePhotos(res.photos);
    } catch (err: any) {
      error('Failed to load favorites', err.message);
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleToggleFavorite = async (photo: Photo) => {
    try {
      const updated = await photoService.updatePhoto(photo.photoId, {
        favorite: !photo.favorite,
      });
      // Remove from view if unfavorited
      setFavoritePhotos((prev) => prev.filter((p) => p.photoId !== photo.photoId));
      if (previewPhoto?.photoId === photo.photoId) {
        setPreviewPhoto(null);
      }
      success('Updated', 'Photo removed from favorites.');
      refreshStats();
    } catch (err: any) {
      error('Update failed', err.message);
    }
  };

  const handleDownload = async (photo: Photo) => {
    try {
      info('Generating Pre-Signed S3 URL', 'Requesting temporary download URL...');
      const { downloadUrl, fileName } = await photoService.getDownloadUrl(photo.photoId);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      success('Download Started', 'Secure temporary S3 link generated.');
    } catch (err: any) {
      error('Download Failed', err.message);
    }
  };

  const handleUpdateMetadata = async (photoId: string, updates: Partial<Photo>) => {
    try {
      const updated = await photoService.updatePhoto(photoId, updates);
      setFavoritePhotos((prev) =>
        prev.map((p) => (p.photoId === photoId ? { ...p, ...updated } : p))
      );
      if (previewPhoto?.photoId === photoId) {
        setPreviewPhoto((prev) => (prev ? { ...prev, ...updated } : null));
      }
      success('Metadata Saved', 'Photo updated in DynamoDB.');
    } catch (err: any) {
      error('Save failed', err.message);
      throw err;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await photoService.deletePhoto(deleteTarget.photoId);
      setFavoritePhotos((prev) => prev.filter((p) => p.photoId !== deleteTarget.photoId));
      if (previewPhoto?.photoId === deleteTarget.photoId) {
        setPreviewPhoto(null);
      }
      success('Photo Deleted', 'Original, thumbnail, and DynamoDB records deleted.');
      setDeleteTarget(null);
      refreshStats();
    } catch (err: any) {
      error('Delete failed', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div id="favorites-page" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
            Favorite Photos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Your starred and highlighted photos.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchFavorites}
            isLoading={loading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Favorites Grid */}
      <PhotoGrid
        photos={favoritePhotos}
        isLoading={loading}
        onPreview={(p) => setPreviewPhoto(p)}
        onDetails={(p) => setDetailsPhoto(p)}
        onToggleFavorite={handleToggleFavorite}
        onDownload={handleDownload}
        onDelete={(p) => setDeleteTarget(p)}
        emptyType="favorites"
        onUploadClick={() => navigate('/gallery')}
      />

      {/* Lightbox Preview */}
      <PhotoPreview
        photo={previewPhoto}
        photosList={favoritePhotos}
        onClose={() => setPreviewPhoto(null)}
        onSelectPhoto={(p) => setPreviewPhoto(p)}
        onToggleFavorite={handleToggleFavorite}
        onDownload={handleDownload}
        onDelete={(p) => setDeleteTarget(p)}
        onOpenDetails={(p) => setDetailsPhoto(p)}
      />

      {/* Details & Edit Modal */}
      <PhotoDetailsModal
        photo={detailsPhoto}
        isOpen={!!detailsPhoto}
        onClose={() => setDetailsPhoto(null)}
        onUpdate={handleUpdateMetadata}
        onDownload={handleDownload}
        onDelete={(p) => setDeleteTarget(p)}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Favorite Photo?"
        message="This photo will be permanently deleted from your S3 bucket and DynamoDB database."
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
