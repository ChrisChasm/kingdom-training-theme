/**
 * ContentCard Component
 * Reusable card for displaying strategy courses, articles, and tools
 */

import { Link } from 'react-router-dom';
import { WordPressPost } from '@/lib/wordpress';
import { formatDate, stripHtml, truncate } from '@/lib/utils';

interface ContentCardProps {
  post: WordPressPost;
  type: 'strategy-courses' | 'articles' | 'tools';
}

export default function ContentCard({ post, type }: ContentCardProps) {
  const excerpt = stripHtml(post.excerpt.rendered);
  const truncatedExcerpt = truncate(excerpt, 150);

  return (
    <Link to={`/${type}/${post.slug}`} className="card group">
      {/* Featured Image */}
      {post.featured_image_url && (
        <div className="aspect-video bg-gray-200 overflow-hidden">
          <img
            src={post.featured_image_url}
            alt={post.title.rendered}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary-500 transition-colors">
          {post.title.rendered}
        </h3>

        {/* Date - Hidden for articles and tools */}
        {post.date && type !== 'articles' && type !== 'tools' && (
          <p className="text-sm text-gray-500 mb-3">
            {formatDate(post.date)}
          </p>
        )}

        {/* Excerpt */}
        <p className="text-gray-600 mb-4 leading-relaxed">
          {truncatedExcerpt}
        </p>

        {/* Read More Link */}
        <span className="text-primary-500 font-medium text-sm group-hover:text-primary-600 inline-flex items-center">
          Learn more
          <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

