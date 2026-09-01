import React from 'react';
import { Images, SearchX, HeartOff, UploadCloud, Sparkles } from 'lucide-react';
import { Button } from '../UI/Button';

export interface EmptyGalleryProps {
  type?: 'gallery' | 'search' | 'favorites';
  onUploadClick?: () => void;
}

export const EmptyGallery: React.FC<EmptyGalleryProps> = ({
  type = 'gallery',
  onUploadClick,
}) => {
  const configs = {
    gallery: {
      icon: Images,
      title: 'No photos yet',
      description:
        'Upload your first photo and start building your secure serverless cloud gallery.',
      actionText: 'Upload Photos',
    },
    search: {
      icon: SearchX,
      title: 'No photos matched your search',
      description: 'Try adjusting your search terms, removing filters, or browsing all photos.',
      actionText: undefined,
    },
    favorites: {
      icon: HeartOff,
      title: 'No favorite photos yet',
      description:
        'Click the heart icon on any photo in your gallery to add it to your favorites list.',
      actionText: 'Browse Gallery',
    },
  };

  const config = configs[type] || configs.gallery;
  const Icon = config.icon;

  return (
    <div
      id="empty-gallery-state"
      className="flex flex-col items-center justify-center text-center p-8 sm:p-12 my-6 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 space-y-4"
    >
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
        <Icon className="w-8 h-8" />
      </div>

      <div className="space-y-1.5 max-w-sm">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          {config.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {config.description}
        </p>
      </div>

      {config.actionText && onUploadClick && (
        <div className="pt-2">
          <Button
            size="md"
            variant="primary"
            leftIcon={<UploadCloud className="w-4 h-4" />}
            onClick={onUploadClick}
          >
            {config.actionText}
          </Button>
        </div>
      )}
    </div>
  );
};
