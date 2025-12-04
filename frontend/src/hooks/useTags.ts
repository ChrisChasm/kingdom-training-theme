/**
 * React Query hooks for Tags
 * Provides intelligent caching for tag data
 */

import { useQuery } from '@tanstack/react-query';
import { getTags } from '@/lib/wordpress';
import { queryKeys, STALE_TIMES, CACHE_TIMES } from '@/lib/query-client';

interface TagsParams {
  per_page?: number;
  page?: number;
  orderby?: string;
  order?: 'asc' | 'desc';
  hide_empty?: boolean;
  post_type?: string;
}

/**
 * Hook to fetch tags with caching
 */
export function useTags(params: TagsParams = {}) {
  return useQuery({
    queryKey: queryKeys.tags.byType(params.post_type),
    queryFn: () => getTags(params),
    staleTime: STALE_TIMES.TAGS,
    gcTime: CACHE_TIMES.TAGS,
  });
}

