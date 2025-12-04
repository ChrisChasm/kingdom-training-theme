/**
 * ContentCard Component
 * Reusable card for displaying strategy courses, articles, and tools
 */

import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { WordPressPost } from '@/lib/wordpress';
import { formatDate, stripHtml, truncate, buildLanguageUrl, generateImageSrcset } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

interface ContentCardProps {
  post: WordPressPost;
  type: 'strategy-courses' | 'articles' | 'tools';
  lang?: string | null;
  defaultLang?: string | null;
}

function ContentCard({ post, type, lang, defaultLang }: ContentCardProps) {
  const { t } = useTranslation();
  
  // Memoize expensive computations
  const excerpt = useMemo(() => stripHtml(post.excerpt.rendered), [post.excerpt.rendered]);
  const truncatedExcerpt = useMemo(() => truncate(excerpt, 150), [excerpt]);
  
  // Build language-aware URL (memoized)
  const url = useMemo(() => {
    const basePath = `/${type}/${post.slug}`;
    return buildLanguageUrl(basePath, lang || null, defaultLang || null);
  }, [type, post.slug, lang, defaultLang]);

  // Generate responsive image srcset if available
  const imageSrcset = useMemo(() => {
    return generateImageSrcset(post.featured_image_sizes);
  }, [post.featured_image_sizes]);

  return (
    <Link to={url} className="card group">
      {/* Featured Image */}
      {post.featured_image_url && (
        <div className="aspect-video bg-gray-200 overflow-hidden">
          <img
            src={post.featured_image_url}
            alt={post.title.rendered}
            loading="lazy"
            decoding="async"
            width="800"
            height="450"
            srcSet={imageSrcset?.srcset}
            sizes={imageSrcset?.sizes}
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
          {t('ui_read_more')}
          <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

// Memoize component to prevent unnecessary re-renders
export default memo(ContentCard, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.post.id === nextProps.post.id &&
    prevProps.post.title.rendered === nextProps.post.title.rendered &&
    prevProps.post.excerpt.rendered === nextProps.post.excerpt.rendered &&
    prevProps.post.featured_image_url === nextProps.post.featured_image_url &&
    prevProps.type === nextProps.type &&
    prevProps.lang === nextProps.lang &&
    prevProps.defaultLang === nextProps.defaultLang
  );
});

