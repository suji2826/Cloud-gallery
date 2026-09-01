import React, { useEffect } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import {
  UploadCloud,
  ArrowLeft,
  Sparkles,
  Trash2,
  Play,
  ShieldCheck,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { Button } from '../components/UI/Button';
import { UploadDropzone } from '../components/Upload/UploadDropzone';
import { UploadPreview } from '../components/Upload/UploadPreview';
import { useUpload } from '../hooks/useUpload';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshStats } = useOutletContext<{ refreshStats: () => void }>() || { refreshStats: () => {} };

  const {
    queue,
    isUploading,
    addFilesToQueue,
    updateQueueItem,
    removeFromQueue,
    clearQueue,
    startUpload,
  } = useUpload(() => {
    refreshStats();
  });

  // Handle incoming files from dashboard or drag-drop redirect
  useEffect(() => {
    const incomingFiles = (location.state as any)?.incomingFiles;
    if (incomingFiles && incomingFiles.length > 0) {
      addFilesToQueue(incomingFiles);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, addFilesToQueue]);

  const hasQueuedItems = queue.some((i) => i.status === 'queued' || i.status === 'error');
  const allCompleted = queue.length > 0 && queue.every((i) => i.status === 'completed');

  return (
    <div id="upload-page" className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Upload to S3 Cloud
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Files are uploaded directly from your browser to Amazon S3 via Pre-Signed PUT URLs.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {queue.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              disabled={isUploading}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={clearQueue}
            >
              Clear
            </Button>
          )}

          {allCompleted ? (
            <Button
              size="sm"
              variant="primary"
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              onClick={() => navigate('/gallery')}
            >
              Go to Gallery
            </Button>
          ) : (
            <Button
              size="sm"
              variant="primary"
              disabled={!hasQueuedItems || isUploading}
              isLoading={isUploading}
              leftIcon={<Play className="w-3.5 h-3.5" />}
              onClick={startUpload}
            >
              {isUploading ? 'Uploading to S3...' : `Start Upload (${queue.filter(q => q.status === 'queued').length})`}
            </Button>
          )}
        </div>
      </div>

      {/* Cloud Architecture Pipeline Note */}
      <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-start gap-3 text-xs">
        <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-slate-900 dark:text-white">
            Direct-to-S3 Pre-Signed Upload Pipeline
          </p>
          <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
            1. Pre-Signed PUT URL requested via Lambda • 2. Direct binary transfer to Amazon S3 • 3.
            S3 event triggers Sharp Thumbnail Lambda • 4. DynamoDB metadata indexed.
          </p>
        </div>
      </div>

      {/* Dropzone */}
      <UploadDropzone onFilesSelected={addFilesToQueue} disabled={isUploading} />

      {/* Queue Preview List */}
      <UploadPreview
        items={queue}
        onUpdateItem={updateQueueItem}
        onRemoveItem={removeFromQueue}
        isUploading={isUploading}
      />
    </div>
  );
};
