import { useState } from 'react';
import { Upload, File, X } from 'lucide-react';
import { formatFileSize } from '@/lib/crypto';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  file: File | null;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  disabled?: boolean;
  accept?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  id: string;
}

export function FileUpload({
  file,
  onFileSelect,
  onClear,
  disabled = false,
  accept,
  inputRef,
  id,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // Create a synthetic event for onFileSelect
      const syntheticEvent = {
        target: {
          files: files,
        },
      } as React.ChangeEvent<HTMLInputElement>;
      onFileSelect(syntheticEvent);
    }
  };

  return (
    <div className="space-y-3">
      {!file ? (
        <label
          htmlFor={id}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'relative flex flex-col items-center justify-center w-full h-44 sm:h-52',
            'border-2 border-dashed rounded-lg cursor-pointer',
            'bg-muted/20 transition-all',
            'group',
            disabled
              ? 'opacity-50 cursor-not-allowed'
              : isDragging
              ? 'border-primary bg-primary/5 scale-[1.01]'
              : 'border-border hover:border-primary/40 hover:bg-muted/30'
          )}
        >
          <div className="flex flex-col items-center justify-center gap-3.5 p-6 text-center pointer-events-none">
            <div className={cn(
              'p-4 rounded-full bg-background border transition-all',
              !disabled && 'group-hover:border-primary/30 group-hover:bg-primary/5',
              isDragging && 'scale-110 bg-primary/10 border-primary/40'
            )}>
              <Upload className={cn(
                'w-7 h-7 sm:w-8 sm:h-8 transition-all',
                disabled ? 'text-muted-foreground' : isDragging ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
              )} />
            </div>
            <div className="space-y-1.5">
              <p className={cn(
                'text-sm font-medium transition-colors',
                isDragging ? 'text-primary' : 'text-foreground'
              )}>
                {isDragging ? 'Drop your file here' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-muted-foreground">
                Any file up to 100MB
              </p>
            </div>
          </div>
          <input
            id={id}
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={onFileSelect}
            disabled={disabled}
            accept={accept}
          />
        </label>
      ) : (
        <div className="relative flex items-center gap-3.5 p-4 rounded-lg border border-border bg-muted/30 animate-scale-in">
          <div className="flex-shrink-0 p-2.5 rounded-lg bg-primary/10 border border-primary/20">
            <File className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {file.name}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatFileSize(file.size)}
            </p>
          </div>
          {!disabled && (
            <button
              onClick={onClear}
              className="flex-shrink-0 p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all active:scale-95"
              type="button"
              aria-label="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
