import React, { useRef, useState } from 'react';
import { UploadCloud, Image, FileCheck, AlertCircle } from 'lucide-react';
import { Button } from '../UI/Button';
import { CloudBadge } from '../UI/CloudBadge';

export interface UploadDropzoneProps {
  onFilesSelected: (files: FileList | File[]) => void;
  disabled?: boolean;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onFilesSelected,
  disabled = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!disabled && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`relative rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-200 cursor-pointer overflow-hidden ${
        isDragOver
          ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 scale-[1.008]'
          : 'border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 hover:border-blue-400 dark:hover:border-blue-500/60 hover:bg-slate-50 dark:hover:bg-slate-900'
      } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleChange}
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center space-y-4 max-w-md mx-auto">
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-200 ${
            isDragOver
              ? 'bg-blue-600 text-white scale-110 shadow-md'
              : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
          }`}
        >
          <UploadCloud className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Drag & drop your photos here
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            or <span className="text-blue-600 dark:text-blue-400 font-semibold underline">browse from your computer</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] text-slate-400">
          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono">
            JPG, PNG, WEBP
          </span>
          <span>•</span>
          <span>Max 25MB per photo</span>
          <span>•</span>
          <span className="text-blue-600 dark:text-blue-400 font-medium">
            Direct S3 Pre-Signed PUT
          </span>
        </div>
      </div>
    </div>
  );
};
