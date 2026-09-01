import React, { useState } from 'react';
import {
  Heart,
  Download,
  Eye,
  Trash2,
  Edit3,
  Calendar,
  HardDrive,
  Tag,
  Loader2,
  Maximize2,
} from 'lucide-react';
import { Photo } from '../../types';
import { formatBytes, formatRelativeTime } from '../../utils/formatters';

export interface PhotoCardProps {
  photo: Photo;
  onPreview: (photo: Photo) => void;
  onDetails: (photo: Photo) => void;
  onToggleFavorite: (photo: Photo) => void;
  onDownload: (photo: Photo) => void;
  onDelete: (photo: Photo) => void;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  onPreview,
  onDetails,
  onToggleFavorite,
  onDownload,
  onDelete,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div
      id={`photo-card-${photo.photoId}`}
      className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/50 transition-all duration-200 flex flex-col"
    >
      {/* Thumbnail Container */}
      <div
        className="relative aspect-4/3 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer"
        onClick={() => onPreview(photo)}
      >
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-200/60 dark:bg-slate-800/60 animate-pulse">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          </div>
        )}

        <img
          src={imageError ? '/placeholder.jpg' : photo.thumbnailUrl || photo.originalUrl}
          alt={photo.caption || photo.fileName}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Top Badges: Format & Favorite */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none z-10">
          <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase shadow-xs">
            {photo.thumbnailUrl ? 'Thumbnail' : photo.contentType.replace('image/', '')}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(photo);
            }}
            className={`pointer-events-auto p-1.5 rounded-full backdrop-blur-md transition-all duration-200 ${
              photo.favorite
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                : 'bg-slate-950/40 text-white/80 hover:bg-slate-950/80 hover:text-white'
            }`}
            title={photo.favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-3.5 h-3.5 ${photo.favorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Hover Quick Actions Overlay */}
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-3 pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPreview(photo);
              }}
              title="Quick Preview"
              className="p-2 rounded-xl bg-white/90 hover:bg-white text-slate-800 shadow-sm transition-all cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDownload(photo);
              }}
              title="Download via S3 Pre-Signed URL"
              className="p-2 rounded-xl bg-white/90 hover:bg-white text-slate-800 shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDetails(photo);
              }}
              title="Inspect & Edit Metadata"
              className="p-2 rounded-xl bg-white/90 hover:bg-white text-slate-800 shadow-sm transition-all cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(photo);
              }}
              title="Delete Photo"
              className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Card Info Footer */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h4
            onClick={() => onDetails(photo)}
            className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
            title={photo.caption || photo.fileName}
          >
            {photo.caption || photo.fileName}
          </h4>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            {formatRelativeTime(photo.uploadedAt)} • {formatBytes(photo.size)}
          </p>
        </div>

        {/* Tags and Cloud Details */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {photo.tags && photo.tags.length > 0 ? (
            photo.tags.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[10px] px-2 py-0.5 rounded-full font-medium"
              >
                #{tag}
              </span>
            ))
          ) : (
            <span className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-medium">
              S3 Direct
            </span>
          )}
          <span className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-medium">
            {photo.contentType.replace('image/', '').toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};
