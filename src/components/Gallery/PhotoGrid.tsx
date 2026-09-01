import React from 'react';
import { Photo, GridDensity } from '../../types';
import { PhotoCard } from './PhotoCard';
import { GallerySkeletonGrid } from '../UI/Skeleton';
import { EmptyGallery } from './EmptyGallery';

export interface PhotoGridProps {
  photos: Photo[];
  isLoading?: boolean;
  density?: GridDensity;
  onPreview: (photo: Photo) => void;
  onDetails: (photo: Photo) => void;
  onToggleFavorite: (photo: Photo) => void;
  onDownload: (photo: Photo) => void;
  onDelete: (photo: Photo) => void;
  emptyType?: 'gallery' | 'search' | 'favorites';
  onUploadClick?: () => void;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  isLoading = false,
  density = 'comfortable',
  onPreview,
  onDetails,
  onToggleFavorite,
  onDownload,
  onDelete,
  emptyType = 'gallery',
  onUploadClick,
}) => {
  if (isLoading) {
    return <GallerySkeletonGrid count={8} />;
  }

  if (photos.length === 0) {
    return <EmptyGallery type={emptyType} onUploadClick={onUploadClick} />;
  }

  const gridDensityClasses = {
    compact: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3',
    comfortable: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4',
    spacious: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6',
  };

  return (
    <div className={`grid ${gridDensityClasses[density]} transition-all duration-300`}>
      {photos.map((photo) => (
        <PhotoCard
          key={photo.photoId}
          photo={photo}
          onPreview={onPreview}
          onDetails={onDetails}
          onToggleFavorite={onToggleFavorite}
          onDownload={onDownload}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
