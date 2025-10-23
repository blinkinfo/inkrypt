import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  message: string;
  show: boolean;
}

export function EmptyState({ icon, message, show }: EmptyStateProps) {
  if (!show) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
      <div className="text-center text-muted-foreground/40 space-y-3">
        <div className="flex justify-center opacity-20">
          {icon}
        </div>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
}
