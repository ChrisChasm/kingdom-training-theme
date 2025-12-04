/**
 * React Query hooks for Articles
 * Provides intelligent caching and deduplication for article data
 */

import { useQuery } from '@tanstack/react-query';
import { getArticles, getArticleBySlug, getArticleCategories, WordPressPost } from '@/lib/wordpress';
import { queryKeys, STALE_TIMES, CACHE_TIMES } from '@/lib/query-client';

interface ArticlesParams {
  per_page?: number;
  page?: number;
  orderby?: string;
  order?: 'asc' | 'desc';
  article_categories?: string;
  tags?: string;
  lang?: string;
}

/**
 * Hook to fetch a list of articles with caching
 */
export function useArticles(params: ArticlesParams = {}) {
  return useQuery({
    queryKey: queryKeys.articles.list(params as Record<string, unknown>),
    queryFn: () => getArticles(params),
    staleTime: STALE_TIMES.ARTICLES,
    gcTime: CACHE_TIMES.ARTICLES,
  });
}

/**
 * Hook to fetch a single article by slug
 */
export function useArticle(slug: string | undefined, lang?: string) {
  return useQuery({
    queryKey: queryKeys.articles.detail(slug || '', lang),
    queryFn: () => slug ? getArticleBySlug(slug, lang) : null,
    enabled: !!slug,
    staleTime: STALE_TIMES.ARTICLES,
    gcTime: CACHE_TIMES.ARTICLES,
  });
}

/**
 * Hook to fetch article categories
 */
export function useArticleCategories() {
  return useQuery({
    queryKey: queryKeys.articles.categories(),
    queryFn: () => getArticleCategories(),
    staleTime: STALE_TIMES.CATEGORIES,
    gcTime: CACHE_TIMES.CATEGORIES,
  });
}

/**
 * Filter articles by language (client-side filter for results)
 */
export function filterArticlesByLanguage(
  articles: WordPressPost[],
  targetLang: string | null
): WordPressPost[] {
  return articles.filter(article => {
    if (targetLang === null) {
      // Default language: include posts with null/undefined language
      return article.language === null || article.language === undefined;
    } else {
      // Specific language: only include posts matching that language
      return article.language === targetLang;
    }
  });
}

