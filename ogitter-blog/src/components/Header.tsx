import React from 'react';
import { ExternalLink, RefreshCw, Github, BookOpen } from 'lucide-react';

interface HeaderProps {
  postCount: number;
  isLoading: boolean;
  onRefresh: () => void;
  onHomeClick: () => void;
  isPostActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  postCount,
  isLoading,
  onRefresh,
  onHomeClick,
  isPostActive,
}) => {
  return (
    <header className="border-b border-stone-200 bg-stone-50/80 backdrop-blur-md sticky top-0 z-20 transition-all">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <button
          id="btn-header-home"
          onClick={onHomeClick}
          className="group text-left flex items-center gap-3 transition-opacity hover:opacity-80 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 rounded-sm"
          title="Ana Sayfaya Dön"
        >
          <div className="w-8 h-8 rounded-full bg-stone-900 text-stone-100 flex items-center justify-center font-mono text-sm font-semibold shadow-xs">
            og
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif-title text-xl font-bold tracking-tight text-stone-900 group-hover:text-stone-700 transition-colors">
                ogitter
              </span>
              <span className="text-[11px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-stone-200/80 text-stone-700 font-medium">
                blog
              </span>
            </div>
            <p className="text-xs text-stone-500 font-mono hidden sm:block">
              ogul-guney / ogitter / posts
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          {postCount > 0 && !isPostActive && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-mono text-stone-600 bg-stone-100 border border-stone-200 px-2.5 py-1 rounded-full">
              <BookOpen className="w-3.5 h-3.5 text-stone-500" />
              <span>{postCount} {postCount === 1 ? 'yazı' : 'yazı'}</span>
            </span>
          )}

          <button
            id="btn-refresh-posts"
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="Yazıları Yenile (GitHub API)"
            aria-label="Yazıları Yenile"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? 'animate-spin text-stone-900' : ''}`}
            />
          </button>

          <a
            id="link-github-repo"
            href="https://github.com/ogul-guney/ogitter/tree/main/posts"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-stone-700 hover:text-stone-950 bg-stone-100 hover:bg-stone-200/80 border border-stone-200 px-3 py-1.5 rounded-lg transition-colors"
            title="GitHub Deposunda Görüntüle"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden md:inline">GitHub</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        </div>
      </div>
    </header>
  );
};
