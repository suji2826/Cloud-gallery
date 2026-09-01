import React from 'react';
import { X, Tag, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { UploadQueueItem } from '../../types';
import { formatBytes } from '../../utils/formatters';

export interface UploadPreviewProps {
  items: UploadQueueItem[];
  onUpdateItem: (id: string, updates: Partial<UploadQueueItem>) => void;
  onRemoveItem: (id: string) => void;
  isUploading: boolean;
}

export const UploadPreview: React.FC<UploadPreviewProps> = ({
  items,
  onUpdateItem,
  onRemoveItem,
  isUploading,
}) => {
  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
        <span>Files in Queue ({items.length})</span>
        <span className="text-slate-400 font-normal">Add captions or tags before starting upload</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[480px] overflow-y-auto pr-1">
        {items.map((item) => {
          const isDone = item.status === 'completed';
          const isError = item.status === 'error';
          const inProgress = item.status !== 'queued' && !isDone && !isError;

          return (
            <div
              key={item.id}
              className={`p-3 rounded-2xl border bg-white dark:bg-slate-900 flex gap-3 relative transition-all duration-200 ${
                isDone
                  ? 'border-emerald-500/50 bg-emerald-50/10'
                  : isError
                  ? 'border-rose-500/50 bg-rose-50/10'
                  : 'border-slate-200/80 dark:border-slate-800'
              }`}
            >
              {/* Thumbnail Image */}
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 relative border border-slate-200/60 dark:border-slate-800">
                <img
                  src={item.previewUrl}
                  alt={item.fileName}
                  className="w-full h-full object-cover"
                />
                {isDone && (
                  <div className="absolute inset-0 bg-emerald-950/60 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                )}
                {isError && (
                  <div className="absolute inset-0 bg-rose-950/60 flex items-center justify-center text-rose-400">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                )}
              </div>

              {/* Editable Fields & Details */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {item.fileName}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {formatBytes(item.size)} • {item.contentType.replace('image/', '')}
                    </p>
                  </div>

                  {!isUploading && (
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Caption Input */}
                {!isDone && (
                  <input
                    type="text"
                    value={item.caption}
                    disabled={isUploading}
                    onChange={(e) => onUpdateItem(item.id, { caption: e.target.value })}
                    placeholder="Photo caption..."
                    className="w-full text-xs px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                  />
                )}

                {/* Progress status if uploading */}
                {inProgress && (
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        {item.status === 'requesting-url' && 'Getting Pre-Signed S3 URL...'}
                        {item.status === 'uploading-s3' && 'Uploading directly to S3...'}
                        {item.status === 'confirming' && 'Lambda Thumbnail & DynamoDB...'}
                      </span>
                      <span className="font-mono">{item.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-200"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Error message */}
                {isError && (
                  <p className="text-[10px] text-rose-500 font-medium">
                    {item.errorMessage || 'Failed to upload'}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
