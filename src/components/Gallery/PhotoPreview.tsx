import React, { useEffect, useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Heart,
  Trash2,
  Info,
  Edit3,
  HardDrive,
  Calendar,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Photo } from '../../types';
import { formatBytes, formatDate } from '../../utils/formatters';

export interface PhotoPreviewProps {
  photo: Photo | null;
  photosList: Photo[];
  onClose: () => void;
  onSelectPhoto: (p: Photo) => void;
  onToggleFavorite: (p: Photo) => void;
  onDownload: (p: Photo) => void;
  onDelete: (p: Photo) => void;
  onOpenDetails: (p: Photo) => void;
}

export const PhotoPreview: React.FC<PhotoPreviewProps> = ({
  photo,
  photosList,
  onClose,
  onSelectPhoto,
  onToggleFavorite,
  onDownload,
  onDelete,
  onOpenDetails,
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const currentIndex = photo ? photosList.findIndex((p) => p.photoId === photo.photoId) : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < photosList.length - 1;

  const handlePrev = () => {
    if (hasPrev) {
      setZoomLevel(1);
      onSelectPhoto(photosList[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      setZoomLevel(1);
      onSelectPhoto(photosList[currentIndex + 1]);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!photo) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    if (photo) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [photo, currentIndex, photosList]);

  if (!photo) return null;

  return (
    <AnimatePresence>
      <div
        id="photo-preview-lightbox"
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md overflow-hidden select-none"
      >
        {/* Top Control Bar */}
        <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-slate-950/80 to-transparent flex items-center justify-between px-4 sm:px-6 z-20 pointer-events-auto">
          {/* File Name & Counter */}
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <span className="text-xs font-mono text-slate-400 bg-white/10 px-2 py-0.5 rounded">
              {currentIndex + 1} / {photosList.length}
            </span>
            <h3 className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
              {photo.caption || photo.fileName}
            </h3>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-white">
            <button
              type="button"
              onClick={() => onToggleFavorite(photo)}
              className={`p-2 rounded-xl transition-colors ${
                photo.favorite
                  ? 'bg-rose-500 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white'
              }`}
              title="Toggle Favorite"
            >
              <Heart className={`w-4 h-4 ${photo.favorite ? 'fill-current' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => onDownload(photo)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
              title="Download via Secure Pre-Signed S3 URL"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowInfo(!showInfo)}
              className={`p-2 rounded-xl transition-colors ${
                showInfo ? 'bg-indigo-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white/80'
              }`}
              title="Toggle Photo Cloud Info"
            >
              <Info className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenDetails(photo);
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
              title="Edit Photo Metadata"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                onDelete(photo);
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-rose-600 text-white/80 hover:text-white transition-colors"
              title="Delete Photo"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="h-5 w-px bg-white/20 mx-1" />

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/30 text-white transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Previous Button */}
        {hasPrev && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-white/10 hover:bg-white/25 text-white backdrop-blur-md transition-all z-20"
            title="Previous Photo (Left Arrow)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next Button */}
        {hasNext && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-white/10 hover:bg-white/25 text-white backdrop-blur-md transition-all z-20"
            title="Next Photo (Right Arrow)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Main Stage Image */}
        <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-16">
          <motion.div
            key={photo.photoId}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative max-w-full max-h-full flex items-center justify-center overflow-hidden"
          >
            <img
              src={photo.originalUrl || photo.thumbnailUrl}
              alt={photo.caption || photo.fileName}
              style={{ transform: `scale(${zoomLevel})` }}
              className="max-h-[82vh] max-w-[90vw] object-contain rounded-xl shadow-2xl transition-transform duration-200"
            />
          </motion.div>
        </div>

        {/* Floating Info Drawer (if toggled) */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="absolute right-4 top-20 bottom-20 w-80 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-5 text-white shadow-2xl z-30 overflow-y-auto space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Cloud Metadata
                </h4>
                <button
                  type="button"
                  onClick={() => setShowInfo(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">File Name</span>
                  <span className="font-semibold break-all">{photo.fileName}</span>
                </div>

                {photo.caption && (
                  <div>
                    <span className="text-slate-400 block text-[11px]">Caption</span>
                    <span>{photo.caption}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Size</span>
                    <span className="font-mono">{formatBytes(photo.size)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Type</span>
                    <span className="font-mono">{photo.contentType}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Uploaded Date</span>
                  <span>{formatDate(photo.uploadedAt)}</span>
                </div>

                {photo.tags && photo.tags.length > 0 && (
                  <div>
                    <span className="text-slate-400 block text-[11px] mb-1">Tags</span>
                    <div className="flex flex-wrap gap-1">
                      {photo.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* S3 & DynamoDB Details */}
                <div className="pt-2 border-t border-slate-800 space-y-1.5 text-[10px] font-mono text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>S3 Key:</span>
                    <span className="text-slate-200 truncate max-w-[160px]">{photo.originalKey}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Photo ID:</span>
                    <span className="text-slate-200 truncate max-w-[160px]">{photo.photoId}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};
