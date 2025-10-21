import * as React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

export function ToastItem({ toast, onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 rounded-xl shadow-lg border-2 animate-slide-in',
        'min-w-[300px] max-w-md backdrop-blur-sm',
        toast.type === 'success'
          ? 'bg-success/10 border-success/50'
          : 'bg-destructive/10 border-destructive/50'
      )}
    >
      {toast.type === 'success' ? (
        <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
      )}
      <p
        className={cn(
          'flex-1 text-sm font-medium',
          toast.type === 'success' ? 'text-success' : 'text-destructive'
        )}
      >
        {toast.message}
      </p>
      <button
        onClick={() => onClose(toast.id)}
        className={cn(
          'p-1 rounded-md transition-colors',
          toast.type === 'success'
            ? 'hover:bg-success/20 text-success'
            : 'hover:bg-destructive/20 text-destructive'
        )}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <div className="pointer-events-auto space-y-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </div>
    </div>
  );
}
