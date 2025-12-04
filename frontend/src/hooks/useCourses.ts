/**
 * React Query hooks for Strategy Courses
 * Provides intelligent caching and deduplication for course data
 */

import { useQuery } from '@tanstack/react-query';
import { 
  getStrategyCourses, 
  getStrategyCourseBySlug, 
  getOrderedCourseSteps,
  getStrategyCourseCategories,
  WordPressPost
} from '@/lib/wordpress';
import { queryKeys, STALE_TIMES, CACHE_TIMES } from '@/lib/query-client';

interface CoursesParams {
  per_page?: number;
  page?: number;
  orderby?: string;
  order?: 'asc' | 'desc';
  strategy_course_categories?: string;
  search?: string;
  lang?: string;
}

/**
 * Hook to fetch a list of strategy courses with caching
 */
export function useCourses(params: CoursesParams = {}) {
  return useQuery({
    queryKey: queryKeys.courses.list(params as Record<string, unknown>),
    queryFn: () => getStrategyCourses(params),
    staleTime: STALE_TIMES.COURSES,
    gcTime: CACHE_TIMES.COURSES,
  });
}

/**
 * Hook to fetch a single course by slug
 */
export function useCourse(slug: string | undefined, lang?: string) {
  return useQuery({
    queryKey: queryKeys.courses.detail(slug || '', lang),
    queryFn: () => slug ? getStrategyCourseBySlug(slug, lang) : null,
    enabled: !!slug,
    staleTime: STALE_TIMES.COURSES,
    gcTime: CACHE_TIMES.COURSES,
  });
}

/**
 * Hook to fetch ordered course steps (the MVP course)
 */
export function useOrderedCourseSteps(lang?: string, defaultLang?: string | null) {
  return useQuery({
    queryKey: queryKeys.courses.ordered(lang, defaultLang),
    queryFn: () => getOrderedCourseSteps(lang, defaultLang),
    staleTime: STALE_TIMES.COURSES,
    gcTime: CACHE_TIMES.COURSES,
  });
}

/**
 * Hook to fetch strategy course categories
 */
export function useCourseCategories() {
  return useQuery({
    queryKey: queryKeys.courses.categories(),
    queryFn: () => getStrategyCourseCategories(),
    staleTime: STALE_TIMES.CATEGORIES,
    gcTime: CACHE_TIMES.CATEGORIES,
  });
}

/**
 * Filter courses by language (client-side filter for results)
 */
export function filterCoursesByLanguage(
  courses: WordPressPost[],
  targetLang: string | null
): WordPressPost[] {
  return courses.filter(course => {
    if (targetLang === null) {
      // Default language: include posts with null/undefined language
      return course.language === null || course.language === undefined;
    } else {
      // Specific language: only include posts matching that language
      return course.language === targetLang;
    }
  });
}

/**
 * Get additional resources (courses not in ordered steps)
 */
export function getAdditionalResources(
  allCourses: WordPressPost[],
  orderedSteps: WordPressPost[],
  currentSlug?: string,
  targetLang?: string | null,
  limit: number = 9
): WordPressPost[] {
  const stepSlugs = orderedSteps.map(step => step.slug);
  
  return allCourses
    .filter(course => {
      // Exclude courses with steps
      if (stepSlugs.includes(course.slug)) {
        return false;
      }
      // Exclude current course if provided
      if (currentSlug && course.slug === currentSlug) {
        return false;
      }
      // Filter by language
      if (targetLang === null) {
        return course.language === null || course.language === undefined;
      } else if (targetLang) {
        return course.language === targetLang;
      }
      return true;
    })
    .slice(0, limit);
}

