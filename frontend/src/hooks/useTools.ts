/**
 * React Query hooks for Tools
 * Provides intelligent caching and deduplication for tool data
 */

import { useQuery } from '@tanstack/react-query';
import { getTools, getToolBySlug, getToolCategories, WordPressPost } from '@/lib/wordpress';
import { queryKeys, STALE_TIMES, CACHE_TIMES } from '@/lib/query-client';

interface ToolsParams {
  per_page?: number;
  page?: number;
  orderby?: string;
  order?: 'asc' | 'desc';
  tool_categories?: string;
  tags?: string;
  search?: string;
  lang?: string;
}

/**
 * Hook to fetch a list of tools with caching
 */
export function useTools(params: ToolsParams = {}) {
  return useQuery({
    queryKey: queryKeys.tools.list(params as Record<string, unknown>),
    queryFn: () => getTools(params),
    staleTime: STALE_TIMES.TOOLS,
    gcTime: CACHE_TIMES.TOOLS,
  });
}

/**
 * Hook to fetch a single tool by slug
 */
export function useTool(slug: string | undefined, lang?: string) {
  return useQuery({
    queryKey: queryKeys.tools.detail(slug || '', lang),
    queryFn: () => slug ? getToolBySlug(slug, lang) : null,
    enabled: !!slug,
    staleTime: STALE_TIMES.TOOLS,
    gcTime: CACHE_TIMES.TOOLS,
  });
}

/**
 * Hook to fetch tool categories
 */
export function useToolCategories() {
  return useQuery({
    queryKey: queryKeys.tools.categories(),
    queryFn: () => getToolCategories(),
    staleTime: STALE_TIMES.CATEGORIES,
    gcTime: CACHE_TIMES.CATEGORIES,
  });
}

/**
 * Filter tools by language (client-side filter for results)
 */
export function filterToolsByLanguage(
  tools: WordPressPost[],
  targetLang: string | null
): WordPressPost[] {
  return tools.filter(tool => {
    if (targetLang === null) {
      // Default language: include posts with null/undefined language
      return tool.language === null || tool.language === undefined;
    } else {
      // Specific language: only include posts matching that language
      return tool.language === targetLang;
    }
  });
}

