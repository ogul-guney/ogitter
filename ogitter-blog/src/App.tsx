/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Post } from './types';
import { fetchBlogPosts } from './services/github';
import { Header } from './components/Header';
import { PostCard } from './components/PostCard';
import { PostDetail } from './components/PostDetail';
import { ErrorState, EmptyState, LoadingSkeleton } from './components/EmptyOrErrorState';
import { Search, Github, ShieldAlert, Sparkles, X } from 'lucide-react';

export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFromCache, setIsFromCache] = useState<boolean>(false);
  const [rateLimitNotice, setRateLimitNotice] = useState<string | null>(null);

  // Load posts
  const loadPosts = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    setRateLimitNotice(null);

    const result = await fetchBlogPosts(forceRefresh);

    setPosts(result.posts);
    setIsFromCache(!!result.isFromCache);

    if (result.error) {
      if (result.posts.length > 0) {
        setRateLimitNotice(result.error);
      } else {
        setError(result.error);
      }
    }

    // Check if URL hash matches any post
    const hash = window.location.hash.replace('#', '');
    if (hash && result.posts.length > 0) {
      const match = result.posts.find(
        (p) =>
          p.filename.toLowerCase() === hash.toLowerCase() ||
          p.id === hash ||
          p.filename.replace(/\.md$/i, '').toLowerCase() === hash.toLowerCase()
      );
      if (match) {
        setSelectedPost(match);
      }
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadPosts();

    // Listen to hash changes for browser back/forward buttons
    const handleHashChange = () => {
      const currentHash = window.location.hash.replace('#', '');
      if (!currentHash) {
        setSelectedPost(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [loadPosts]);

  // Handle post selection with hash update
  const handleSelectPost = (post: Post) => {
    setSelectedPost(post);
    window.location.hash = post.filename.replace(/\.md$/i, '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setSelectedPost(null);
    // Clear hash without reloading
    history.pushState('', document.title, window.location.pathname + window.location.search);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtered posts based on search
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const query = searchQuery.toLowerCase().trim();
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.filename.toLowerCase().includes(query) ||
        p.excerpt.toLowerCase().includes(query) ||
        p.tags?.some((t) => t.toLowerCase().includes(query))
    );
  }, [posts, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-stone-200">
      {/* Top Navbar */}
      <Header
        postCount={posts.length}
        isLoading={loading || refreshing}
        onRefresh={() => loadPosts(true)}
        onHomeClick={handleBackToList}
        isPostActive={selectedPost !== null}
      />

      {/* Cache & Rate Limit Banner */}
      {rateLimitNotice && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-800 flex items-center justify-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{rateLimitNotice}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">
        {selectedPost ? (
          <PostDetail
            post={selectedPost}
            allPosts={posts}
            onBack={handleBackToList}
            onSelectPost={handleSelectPost}
          />
        ) : (
          <div>
            {/* Minimalist Intro Header */}
            <section className="mb-8 pt-2 pb-6 border-b border-stone-200">
              <h1 className="font-serif-title text-4xl sm:text-5xl font-bold tracking-tight text-stone-950 mb-3">
                Yazılar
              </h1>
              <p className="text-stone-600 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                <span className="font-mono text-stone-800 font-medium">ogul-guney/ogitter</span> deposunun{' '}
                <code className="text-sm font-mono bg-stone-200/70 px-1.5 py-0.5 rounded text-stone-800">
                  posts
                </code>{' '}
                klasöründen GitHub API ile canlı çekilen ve Marked.js ile derlenen blog yazıları.
              </p>

              {/* Search Bar (if posts exist) */}
              {posts.length > 0 && (
                <div className="mt-6 relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    id="input-search-posts"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Yazılarda veya başlıklarda ara..."
                    className="w-full pl-10 pr-10 py-2.5 bg-stone-100/80 hover:bg-stone-100 focus:bg-white border border-stone-200 focus:border-stone-400 rounded-xl text-sm placeholder:text-stone-400 text-stone-900 transition-colors focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 rounded-full"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </section>

            {/* Content states */}
            {loading ? (
              <LoadingSkeleton />
            ) : error ? (
              <ErrorState
                error={error}
                onRetry={() => loadPosts(true)}
                isRetrying={refreshing}
              />
            ) : posts.length === 0 ? (
              <EmptyState
                onRefresh={() => loadPosts(true)}
                isRefreshing={refreshing}
              />
            ) : filteredPosts.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-stone-500 text-sm mb-3">
                  "{searchQuery}" aramasıyla eşleşen bir yazı bulunamadı.
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-mono text-stone-700 underline underline-offset-4 hover:text-stone-950"
                >
                  Aramayı Temizle
                </button>
              </div>
            ) : (
              <div className="divide-y divide-stone-200/80">
                {filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onSelect={handleSelectPost}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Minimalist Footer */}
      <footer className="border-t border-stone-200 py-8 px-4 sm:px-6 text-xs text-stone-500 font-mono">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>
              Kaynak:{' '}
              <a
                href="https://github.com/ogul-guney/ogitter"
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-800 underline hover:text-stone-950 font-medium"
              >
                ogul-guney/ogitter
              </a>
            </span>
            {isFromCache && (
              <span className="text-[10px] text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
                önbellek
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span>Marked.js Markdown Parser</span>
            <span className="text-stone-300">•</span>
            <a
              href="https://github.com/ogul-guney/ogitter/tree/main/posts"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-stone-900 transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Depo</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
