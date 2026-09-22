import React from 'react';
import { Post } from '../types';
import { ArrowRight, Clock, FileText, Calendar } from 'lucide-react';

interface PostCardProps {
  post: Post;
  onSelect: (post: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onSelect }) => {
  return (
    <article
      id={`post-card-${post.id}`}
      onClick={() => onSelect(post)}
      className="group relative cursor-pointer p-6 -mx-4 sm:mx-0 sm:rounded-2xl border border-transparent hover:border-stone-200 hover:bg-stone-100/60 transition-all duration-200"
    >
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500 font-mono">
          <span className="flex items-center gap-1 text-stone-600">
            <FileText className="w-3.5 h-3.5 text-stone-400" />
            {post.filename}
          </span>
          <span className="text-stone-300">•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-stone-400" />
            {post.readingTimeMinutes} dk okuma
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

        <h2 className="font-serif-title text-2xl font-bold tracking-tight text-stone-900 group-hover:text-stone-700 transition-colors flex items-center justify-between gap-4">
          <span>{post.title}</span>
          <ArrowRight className="w-4 h-4 text-stone-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0" />
        </h2>

        {post.excerpt && (
          <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed">
            {post.excerpt}
          </p>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-200/70 text-stone-700"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
};
