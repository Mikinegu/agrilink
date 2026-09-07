import React from 'react';
import { Loader2, Sprout } from 'lucide-react';

interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label = 'Loading AgriLink...',
  size = 'md',
  fullScreen = false,
}) => {
  const spinnerSize = size === 'sm' ? 'h-5 w-5' : size === 'lg' ? 'h-10 w-10' : 'h-8 w-8';

  const content = (
    <div className="flex flex-col items-center justify-center gap-3 p-6 text-center animate-fade-in">
      <div className="relative flex items-center justify-center">
        <div className="absolute h-12 w-12 rounded-full border-2 border-emerald-500/20 animate-ping" />
        <div className="h-12 w-12 rounded-2xl bg-emerald-600/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 shadow-sm">
          <Sprout className="h-6 w-6 animate-pulse" />
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        <Loader2 className={`${spinnerSize} animate-spin text-emerald-600`} />
        <span>{label}</span>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-50/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};
