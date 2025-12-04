/**
 * React Query hooks for Search
 * Provides intelligent caching for search results
 */

import { useQuery } from '@tanstack/react-query';
import { searchStrategyCoursesAndTools } from '@/lib/wordpress';
import { queryKeys, STALE_TIMES, CACHE_TIMES } from '@/lib/query-client';

/**
 * Hook to search strategy courses and tools with caching
 */
export function useSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.search.query(query),
    queryFn: () => searchStrategyCoursesAndTools(query),
    enabled: query.trim().length >= 2,
    staleTime: STALE_TIMES.SEARCH,
    gcTime: CACHE_TIMES.SEARCH,
  });
}

