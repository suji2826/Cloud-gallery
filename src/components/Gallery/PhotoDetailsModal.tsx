import React, { useState, useEffect } from 'react';
import {
  Download,
  Trash2,
  Heart,
  Save,
  Tag,
  Calendar,
  HardDrive,
  Database,
  Globe,
  FileText,
  Key,
  Shield,
  Layers,
  Check,
} from 'lucide-react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { CloudBadge } from '../UI/CloudBadge';
import { Photo } from '../../types';
import { formatBytes, formatDate } from '../../utils/formatters';
import { AWS_CONFIG } from '../../config/aws-config';

export interface PhotoDetailsModalProps {
  photo: Photo | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (photoId: string, updates: Partial<Photo>) => Promise<void>;
  onDownload: (photo: Photo) => void;
  onDelete: (photo: Photo) => void;
}

export const PhotoDetailsModal: React.FC<PhotoDetailsModalProps> = ({
  photo,
  isOpen,
  onClose,
  onUpdate,
  onDownload,
  onDelete,
}) => {
  const [caption, setCaption] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'cloud-metadata'>('details');

  useEffect(() => {
    if (photo) {
      setCaption(photo.caption || '');
      setTags(photo.tags || []);
      setIsFavorite(photo.favorite || false);
      setTagInput('');
    }
  }, [photo]);

  if (!photo) return null;

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleaned = tagInput.trim().replace(/^#/, '').toLowerCase();
      if (cleaned && !tags.includes(cleaned)) {
        setTags([...tags, cleaned]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(photo.photoId, {
        caption: caption.trim(),
        tags,
        favorite: isFavorite,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="3xl"
      title={
        <div className="flex items-center gap-3">
          <span className="text-base font-bold text-slate-900 dark:text-white truncate max-w-md">
            {photo.fileName}
          </span>
          <CloudBadge type="dynamodb" size="sm" />
        </div>
      }
    >
      <div className="space-y-5">
        {/* Tabs: Details / Cloud Raw Metadata */}
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'details'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Photo Information & Edit
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cloud-metadata')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'cloud-metadata'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            AWS Cloud & DynamoDB Schema
          </button>
        </div>

        {activeTab === 'details' ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Image Preview Thumbnail */}
            <div className="md:col-span-5 space-y-3">
              <div className="aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 relative">
                <img
                  src={photo.thumbnailUrl || photo.originalUrl}
                  alt={photo.caption || photo.fileName}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                  onClick={() => onDownload(photo)}
                >
                  Download
                </Button>
                <Button
                  size="sm"
                  variant={isFavorite ? 'danger' : 'outline'}
                  leftIcon={<Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />}
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  {isFavorite ? 'Favorited' : 'Favorite'}
                </Button>
              </div>
            </div>

            {/* Editable Fields & Specs */}
            <div className="md:col-span-7 space-y-4">
              {/* Caption */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Photo Caption
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Enter a descriptive caption for your photo..."
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
                />
              </div>

              {/* Tags Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tags (Press Enter or comma to add)
                </label>
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="e.g. travel, nature, sunset..."
                  leftIcon={<Tag className="w-3.5 h-3.5" />}
                />
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-medium"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-blue-400 hover:text-blue-600 dark:hover:text-white cursor-pointer ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Technical Specifications */}
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 p-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">File Size</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {formatBytes(photo.size)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">MIME Content-Type</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {photo.contentType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Uploaded Date</span>
                  <span className="text-slate-800 dark:text-slate-200">
                    {formatDate(photo.uploadedAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Cloud & DynamoDB Raw Schema Tab */
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-800 dark:text-indigo-300 flex items-start gap-2.5">
              <Database className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Amazon DynamoDB Item Attributes</p>
                <p className="text-[11px] opacity-90">
                  Partition Key (PK): <code>{photo.userId}</code> | Sort Key (SK):{' '}
                  <code>{photo.photoId}</code>
                </p>
              </div>
            </div>

            {/* JSON Viewer */}
            <div className="rounded-xl bg-slate-900 text-slate-200 p-4 font-mono text-[11px] overflow-x-auto max-h-64 border border-slate-800">
              <pre>
                {JSON.stringify(
                  {
                    PK: photo.userId,
                    SK: photo.photoId,
                    userId: photo.userId,
                    photoId: photo.photoId,
                    originalKey: photo.originalKey,
                    thumbnailKey: photo.thumbnailKey,
                    fileName: photo.fileName,
                    caption: caption || photo.caption,
                    contentType: photo.contentType,
                    size: photo.size,
                    favorite: isFavorite,
                    tags: tags,
                    uploadedAt: photo.uploadedAt,
                    updatedAt: photo.updatedAt,
                    s3Buckets: {
                      originals: AWS_CONFIG.s3.originalsBucket,
                      thumbnails: AWS_CONFIG.s3.thumbnailsBucket,
                    },
                    cloudFrontDomain: AWS_CONFIG.cloudFront.distributionDomain,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            size="sm"
            variant="ghost"
            className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={() => {
              onClose();
              onDelete(photo);
            }}
          >
            Delete Photo
          </Button>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              isLoading={isSaving}
              leftIcon={<Save className="w-3.5 h-3.5" />}
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
