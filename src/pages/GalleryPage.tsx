import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Images, UploadCloud, RefreshCw } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { PhotoGrid } from '../components/Gallery/PhotoGrid';
import { PhotoPreview } from '../components/Gallery/PhotoPreview';
import { PhotoDetailsModal } from '../components/Gallery/PhotoDetailsModal';
import { ConfirmDialog } from '../components/UI/ConfirmDialog';
import { GalleryFilterBar } from '../components/Gallery/GalleryFilterBar';
import { Photo, GalleryFilterType, GallerySortOption, GridDensity } from '../types';
import { photoService } from '../services/photoService';
import { useToast } from '../context/ToastContext';

export const GalleryPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error, info } = useToast();
  const { refreshStats } = useOutletContext<{ refreshStats: () => void }>() || { refreshStats: () => {} };

  const [allPhotos, setAllPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter and Sort states
  const [filter, setFilter] = useState<GalleryFilterType>('all');
  const [sort, setSort] = useState<GallerySortOption>('newest');
  const [search, setSearch] = useState('');
  const [density, setDensity] = useState<GridDensity>('comfortable');

  // Modals
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);
  const [detailsPhoto, setDetailsPhoto] = useState<Photo | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Photo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await photoService.listPhotos();
      setAllPhotos(res.photos);
    } catch (err: any) {
      error('Failed to load photos', err.message);
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  // Client-side filtering & sorting
  const filteredAndSortedPhotos = useMemo(() => {
    let result = [...allPhotos];

    // Filter type
    if (filter === 'recent') {
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      result = result.filter((p) => new Date(p.uploadedAt).getTime() > oneWeekAgo);
    } else if (filter === 'favorites') {
      result = result.filter((p) => p.favorite);
    } else if (filter.startsWith('image/')) {
      result = result.filter((p) => p.contentType === filter || (filter === 'image/jpeg' && p.contentType === 'image/jpg'));
    }

    // Search query (file name, caption, tags)
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((p) => {
        const nameMatch = p.fileName.toLowerCase().includes(q);
        const captionMatch = p.caption && p.caption.toLowerCase().includes(q);
        const tagMatch = p.tags && p.tags.some((t) => t.toLowerCase().includes(q));
        return nameMatch || captionMatch || tagMatch;
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sort === 'newest') {
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      }
      if (sort === 'oldest') {
        return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      }
      if (sort === 'largest') {
        return b.size - a.size;
      }
      if (sort === 'smallest') {
        return a.size - b.size;
      }
      if (sort === 'name-asc') {
        return (a.caption || a.fileName).localeCompare(b.caption || b.fileName);
      }
      if (sort === 'name-desc') {
        return (b.caption || b.fileName).localeCompare(a.caption || a.fileName);
      }
      return 0;
    });

    return result;
  }, [allPhotos, filter, search, sort]);

  // Action handlers
  const handleToggleFavorite = async (photo: Photo) => {
    try {
      const updated = await photoService.updatePhoto(photo.photoId, {
        favorite: !photo.favorite,
      });
      setAllPhotos((prev) =>
        prev.map((p) => (p.photoId === photo.photoId ? { ...p, favorite: updated.favorite } : p))
      );
      if (previewPhoto?.photoId === photo.photoId) {
        setPreviewPhoto((prev) => (prev ? { ...prev, favorite: updated.favorite } : null));
      }
      success(
        updated.favorite ? 'Added to Favorites' : 'Removed from Favorites',
        'DynamoDB updated.'
      );
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
      setAllPhotos((prev) =>
        prev.map((p) => (p.photoId === photoId ? { ...p, ...updated } : p))
      );
      if (previewPhoto?.photoId === photoId) {
        setPreviewPhoto((prev) => (prev ? { ...prev, ...updated } : null));
      }
      success('Metadata Saved', 'Photo successfully updated in DynamoDB.');
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
      setAllPhotos((prev) => prev.filter((p) => p.photoId !== deleteTarget.photoId));
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

  const emptyStateType =
    search.trim() ? 'search' : filter === 'favorites' ? 'favorites' : 'gallery';

  return (
    <div id="gallery-page" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            Photo Gallery
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse, search, and manage your cloud-stored photos.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchPhotos}
            isLoading={loading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <Button
            size="sm"
            variant="primary"
            leftIcon={<UploadCloud className="w-3.5 h-3.5" />}
            onClick={() => navigate('/upload')}
          >
            Upload Photos
          </Button>
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <GalleryFilterBar
        filter={filter}
        onFilterChange={setFilter}
        sort={sort}
        onSortChange={setSort}
        search={search}
        onSearchChange={setSearch}
        density={density}
        onDensityChange={setDensity}
        totalResults={filteredAndSortedPhotos.length}
      />

      {/* Main Photo Grid */}
      <PhotoGrid
        photos={filteredAndSortedPhotos}
        isLoading={loading}
        density={density}
        onPreview={(p) => setPreviewPhoto(p)}
        onDetails={(p) => setDetailsPhoto(p)}
        onToggleFavorite={handleToggleFavorite}
        onDownload={handleDownload}
        onDelete={(p) => setDeleteTarget(p)}
        emptyType={emptyStateType}
        onUploadClick={() => navigate('/upload')}
      />

      {/* Lightbox Preview */}
      <PhotoPreview
        photo={previewPhoto}
        photosList={filteredAndSortedPhotos}
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
        title="Delete Photo Permanently?"
        message="Are you sure you want to permanently delete this photo? It will be removed from your S3 original bucket, thumbnail cache, and DynamoDB metadata store."
        confirmText="Delete from Cloud"
        variant="danger"
        isLoading={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
