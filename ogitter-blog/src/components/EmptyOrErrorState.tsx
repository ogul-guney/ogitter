import React from 'react';
import { AlertCircle, RefreshCw, FolderSearch } from 'lucide-react';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  isRetrying: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry, isRetrying }) => {
  return (
    <div
      id="state-error-container"
      className="my-12 p-6 sm:p-8 rounded-2xl border border-stone-300 bg-stone-100/70 text-center max-w-xl mx-auto"
    >
      <div className="w-12 h-12 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-6 h-6 text-stone-600" />
      </div>
      <h3 className="font-serif-title text-xl font-bold text-stone-900 mb-2">
        İçerik Yüklenemedi
      </h3>
      <p className="text-sm text-stone-600 mb-6 leading-relaxed">
        {error}
      </p>
      <button
        id="btn-error-retry"
        onClick={onRetry}
        disabled={isRetrying}
        className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-stone-100 rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors cursor-pointer disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
        <span>Yeniden Dene</span>
      </button>
    </div>
  );
};

export const EmptyState: React.FC<{ onRefresh: () => void; isRefreshing: boolean }> = ({
  onRefresh,
  isRefreshing,
}) => {
  return (
    <div
      id="state-empty-container"
      className="my-16 p-8 rounded-2xl border border-dashed border-stone-300 text-center max-w-lg mx-auto"
    >
      <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center mx-auto mb-4">
        <FolderSearch className="w-6 h-6" />
      </div>
      <h3 className="font-serif-title text-xl font-semibold text-stone-800 mb-2">
        Henüz Markdown Yazısı Bulunamadı
      </h3>
      <p className="text-sm text-stone-600 mb-6 leading-relaxed">
        <code className="text-xs bg-stone-200/70 px-1.5 py-0.5 rounded font-mono">
          ogul-guney/ogitter/posts
        </code>{' '}
        klasöründe henüz bir <code className="text-xs font-mono">.md</code> dosyası bulunmuyor.
      </p>
      <button
        id="btn-empty-refresh"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="inline-flex items-center gap-2 px-4 py-2 border border-stone-300 bg-stone-100 text-stone-800 rounded-lg text-sm font-medium hover:bg-stone-200 transition-colors cursor-pointer disabled:opacity-50"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
        <span>Tekrar Kontrol Et</span>
      </button>
    </div>
  );
};

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 py-6 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-6 rounded-2xl border border-stone-200/60 bg-stone-100/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-3 w-28 bg-stone-200 rounded"></div>
            <div className="h-3 w-16 bg-stone-200 rounded"></div>
          </div>
          <div className="h-6 w-3/4 bg-stone-200 rounded mb-3"></div>
          <div className="space-y-2">
            <div className="h-3.5 w-full bg-stone-200/80 rounded"></div>
            <div className="h-3.5 w-5/6 bg-stone-200/80 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
