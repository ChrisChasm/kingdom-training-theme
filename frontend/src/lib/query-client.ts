/**
 * React Query Client Configuration
 * Centralized configuration for API state management with intelligent caching
 */

import { QueryClient } from '@tanstack/react-query';

// Cache time constants (in milliseconds)
export const CACHE_TIMES = {
  // Content that changes infrequently
  LANGUAGES: 1000 * 60 * 60, // 1 hour
  TRANSLATIONS: 1000 * 60 * 60 * 24, // 24 hours
  
  // Content that may change more frequently
  ARTICLES: 1000 * 60 * 5, // 5 minutes
  TOOLS: 1000 * 60 * 5, // 5 minutes
  COURSES: 1000 * 60 * 5, // 5 minutes
  
  // Categories and tags change rarely
  CATEGORIES: 1000 * 60 * 30, // 30 minutes
  TAGS: 1000 * 60 * 30, // 30 minutes
  
  // Search results are more dynamic
  SEARCH: 1000 * 60 * 2, // 2 minutes
};

// Stale time: how long data is considered fresh (won't refetch)
export const STALE_TIMES = {
  LANGUAGES: 1000 * 60 * 60, // 1 hour
  TRANSLATIONS: 1000 * 60 * 60, // 1 hour
  ARTICLES: 1000 * 60 * 5, // 5 minutes
  TOOLS: 1000 * 60 * 5, // 5 minutes
  COURSES: 1000 * 60 * 5, // 5 minutes
  CATEGORIES: 1000 * 60 * 15, // 15 minutes
  TAGS: 1000 * 60 * 15, // 15 minutes
  SEARCH: 1000 * 60, // 1 minute
};

/**
 * Query key factory for consistent key generation
 */
export const queryKeys = {
  // Language queries
  languages: {
    all: ['languages'] as const,
    default: ['languages', 'default'] as const,
  },
  
  // Translation queries
  translations: {
    all: ['translations'] as const,
    byLang: (lang: string | null) => ['translations', lang] as const,
  },
  
  // Article queries
  articles: {
    all: ['articles'] as const,
    list: (params: Record<string, unknown>) => ['articles', 'list', params] as const,
    detail: (slug: string, lang?: string) => ['articles', 'detail', slug, lang] as const,
    categories: () => ['articles', 'categories'] as const,
  },
  
  // Tool queries
  tools: {
    all: ['tools'] as const,
    list: (params: Record<string, unknown>) => ['tools', 'list', params] as const,
    detail: (slug: string, lang?: string) => ['tools', 'detail', slug, lang] as const,
    categories: () => ['tools', 'categories'] as const,
  },
  
  // Strategy course queries
  courses: {
    all: ['courses'] as const,
    list: (params: Record<string, unknown>) => ['courses', 'list', params] as const,
    detail: (slug: string, lang?: string) => ['courses', 'detail', slug, lang] as const,
    ordered: (lang?: string, defaultLang?: string | null) => ['courses', 'ordered', lang, defaultLang] as const,
    categories: () => ['courses', 'categories'] as const,
  },
  
  // Search queries
  search: {
    all: ['search'] as const,
    query: (query: string) => ['search', query] as const,
  },
  
  // Tags (shared across content types)
  tags: {
    all: ['tags'] as const,
    byType: (postType?: string) => ['tags', postType] as const,
  },
};

/**
 * Create and configure the QueryClient
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 5 minutes by default
        staleTime: 1000 * 60 * 5,
        // Keep unused data in cache for 30 minutes
        gcTime: 1000 * 60 * 30,
        // Retry failed requests 2 times
        retry: 2,
        // Don't refetch on window focus by default (reduces API calls)
        refetchOnWindowFocus: false,
        // Don't refetch on mount if data is still fresh
        refetchOnMount: false,
        // Refetch on reconnect
        refetchOnReconnect: true,
      },
    },
  });
}

// Export a singleton instance for the app
export const queryClient = createQueryClient();

