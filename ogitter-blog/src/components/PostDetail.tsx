import React, { useState } from 'react';
import { Post } from '../types';
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Code2,
  BookOpen,
  Share2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface PostDetailProps {
  post: Post;
  allPosts: Post[];
  onBack: () => void;
  onSelectPost: (post: Post) => void;
}

export const PostDetail: React.FC<PostDetailProps> = ({
  post,
  allPosts,
  onBack,
  onSelectPost,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const currentIndex = allPosts.findIndex((p) => p.id === post.id);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost =
    currentIndex !== -1 && currentIndex < allPosts.length - 1
      ? allPosts[currentIndex + 1]
      : null;

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(post.rawMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="py-6 sm:py-10 animate-in fade-in duration-300">
      {/* Top Navigation */}
      <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-stone-200">
        <button
          id="btn-back-to-posts"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-950 transition-colors cursor-pointer py-1.5 px-2.5 -ml-2.5 rounded-lg hover:bg-stone-200/60"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Tüm Yazılar</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            id="btn-toggle-raw"
            onClick={() => setShowRaw(!showRaw)}
            className={`inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              showRaw
                ? 'bg-stone-900 text-stone-100 border-stone-900'
                : 'bg-stone-100 text-stone-600 hover:text-stone-900 border-stone-200 hover:bg-stone-200/70'
            }`}
            title="Ham Markdown veya Render Edilmiş HTML Görünümü"
          >
            {showRaw ? (
              <>
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Render</span>
              </>
            ) : (
              <>
                <Code2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ham .md</span>
              </>
            )}
          </button>

          <button
            id="btn-copy-markdown"
            onClick={handleCopyMarkdown}
            className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200/70 transition-colors cursor-pointer"
            title="Markdown Metnini Kopyala"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 hidden sm:inline">Kopyalandı</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kopyala</span>
              </>
            )}
          </button>

          <button
            id="btn-share-post"
            onClick={handleCopyLink}
            className="p-1.5 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-200/70 border border-stone-200 bg-stone-100 transition-colors cursor-pointer"
            title="Bağlantıyı Kopyala"
          >
            {copiedLink ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Post Article Header */}
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500 font-mono mb-3">
          <span className="text-stone-700 font-medium">posts/{post.filename}</span>
          <span className="text-stone-300">•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-stone-400" />
            {post.readingTimeMinutes} dk okuma ({post.wordCount} kelime)
          </span>
          {post.date && (
            <>
              <span className="text-stone-300">•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-stone-400" />
                {post.date}
              </span>
            </>
          )}
        </div>

        <h1 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 mb-4 leading-tight">
          {post.title}
        </h1>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-mono px-2 py-0.5 rounded bg-stone-200/80 text-stone-700"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
          <span className="font-mono">Marked.js ile derlendi</span>
          <a
            href={post.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-900 transition-colors font-mono underline underline-offset-2"
          >
            <span>GitHub'da Düzenle</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </header>

      {/* Article Body */}
      {showRaw ? (
        <div className="bg-stone-900 text-stone-100 p-4 sm:p-6 rounded-xl font-mono text-sm leading-relaxed overflow-x-auto border border-stone-800">
          <pre className="whitespace-pre-wrap">{post.rawMarkdown}</pre>
        </div>
      ) : (
        <article
          id="article-content"
          className="prose-custom"
          dangerouslySetInnerHTML={{ __html: post.htmlContent }}
        />
      )}

      {/* Bottom Navigation & Actions */}
      <footer className="mt-16 pt-8 border-t border-stone-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prevPost ? (
            <button
              onClick={() => onSelectPost(prevPost)}
              className="group text-left p-4 rounded-xl border border-stone-200 bg-stone-100/50 hover:bg-stone-100 transition-all cursor-pointer flex flex-col gap-1"
            >
              <span className="text-xs font-mono text-stone-500 flex items-center gap-1">
                <ChevronLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                Önceki Yazı
              </span>
              <span className="font-serif-title font-semibold text-stone-900 line-clamp-1">
                {prevPost.title}
              </span>
            </button>
          ) : (
            <div />
          )}

          {nextPost && (
            <button
              onClick={() => onSelectPost(nextPost)}
              className="group text-right p-4 rounded-xl border border-stone-200 bg-stone-100/50 hover:bg-stone-100 transition-all cursor-pointer flex flex-col items-end gap-1 sm:col-start-2"
            >
              <span className="text-xs font-mono text-stone-500 flex items-center gap-1">
                Sonraki Yazı
                <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </span>
              <span className="font-serif-title font-semibold text-stone-900 line-clamp-1">
                {nextPost.title}
              </span>
            </button>
          )}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-mono text-stone-500 hover:text-stone-900 transition-colors cursor-pointer py-1.5 px-3 rounded-lg hover:bg-stone-100"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Yazı listesine dön</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
