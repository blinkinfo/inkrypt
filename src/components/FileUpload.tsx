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
  return (
    <div className="space-y-3">
      {!file ? (
        <label
          htmlFor={id}
          className={cn(
            'relative flex flex-col items-center justify-center w-full h-40 sm:h-48',
            'border-2 border-dashed rounded-xl cursor-pointer',
            'bg-muted/30 hover:bg-muted/50 transition-all duration-200',
            'group',
            disabled
              ? 'opacity-50 cursor-not-allowed'
              : 'border-muted-foreground/25 hover:border-primary/50'
          )}
        >
          <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
            <div className={cn(
              'p-3 rounded-full bg-background shadow-sm',
              'group-hover:shadow-md group-hover:scale-110 transition-all duration-200',
              !disabled && 'group-hover:bg-primary/5'
            )}>
              <Upload className={cn(
                'w-6 h-6 sm:w-8 sm:h-8',
                disabled ? 'text-muted-foreground' : 'text-primary'
              )} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Click to upload or drag and drop
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
        <div className="relative flex items-center gap-3 p-4 rounded-xl border-2 border-primary/20 bg-primary/5 animate-fade-in">
          <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10">
            <File className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {file.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(file.size)}
            </p>
          </div>
          {!disabled && (
            <button
              onClick={onClear}
              className="flex-shrink-0 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
