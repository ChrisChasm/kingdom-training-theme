/**
 * WordPress API Integration
 * Utility functions for fetching data from WordPress REST API
 */

// Detect if running in browser and get API URL
// When served from WordPress theme, use relative path
// Otherwise use environment variable or default
const getAPIUrl = () => {
  if (typeof window !== 'undefined') {
    // Running in browser - use relative path when served from WordPress
    return '/wp-json';
  }
  // Server-side or development - use environment variable (Vite uses import.meta.env)
  return import.meta.env.VITE_WORDPRESS_API_URL || 'http://localhost:8888/wp-json';
};

const API_URL = getAPIUrl();

export interface Translation {
  id: number;
  slug: string;
  language: string;
  link: string;
}

export interface Language {
  term_id: number;
  name: string;
  slug: string;
  locale: string;
  w3c: string;
  facebook: string;
  is_rtl: boolean;
  term_group: number;
  flag_code: string;
  flag_url: string;
  flag: string;
  custom_flag_url?: string;
  custom_flag?: string;
  is_default: boolean;
  active: boolean;
  home_url: string;
  search_url: string;
  host: string;
}

export interface WordPressPost {
  id: number;
  date: string;
  modified: string;
  slug: string;
  status: string;
  type: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  author: number;
  featured_media: number;
  featured_image_url?: string;
  featured_image_sizes?: {
    [size: string]: {
      url: string;
      width: number;
      height: number;
    };
  };
  author_info?: {
    name: string;
    avatar: string;
    bio: string;
  };
  categories?: number[];
  tags?: number[];
  steps?: number | null; // Step number meta field for strategy courses
  language?: string; // Language code (slug) from Polylang
  translations?: Translation[]; // Alternate language versions
  _embedded?: any;
}

export interface MenuItem {
  id: number;
  title: string;
  url: string;
  parent: number;
  order: number;
}

export interface SiteInfo {
  name: string;
  description: string;
  url: string;
  logo: string | null;
}

export interface Category {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: string;
  parent: number;
}

export interface Tag {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: string;
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Read response body once
    const text = await response.text();

    // Check if response is HTML (likely a 404 page or redirect)
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      const contentType = response.headers.get('content-type');
      console.error(`API returned HTML response from ${url}:`, {
        status: response.status,
        statusText: response.statusText,
        contentType,
        preview: text.substring(0, 500)
      });
      throw new Error(`API endpoint returned HTML instead of JSON. This usually means:
1. The endpoint doesn't exist (404 page)
2. WordPress REST API is disabled
3. Permalink structure needs to be flushed (Settings > Permalinks > Save)
4. Custom post types not properly registered
5. Plugin conflict blocking REST API

Check if the endpoint exists: ${url}`);
    }

    if (!response.ok) {
      // Try to parse as JSON for error details
      try {
        const errorData = JSON.parse(text);
        console.error(`API request failed: ${response.status} ${response.statusText}`, errorData);
      } catch {
        console.error(`API request failed: ${response.status} ${response.statusText}`, text.substring(0, 200));
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    // Parse JSON response
    try {
      return JSON.parse(text);
    } catch (parseError) {
      // If JSON parsing fails and it's not HTML, provide helpful error
      if (parseError instanceof SyntaxError) {
        console.error(`JSON parse error from ${url}. Response preview:`, text.substring(0, 200));
        throw new Error(`API endpoint returned invalid JSON. Check: ${url}`);
      }
      throw parseError;
    }
  } catch (error) {
    // If it's already our custom error, re-throw it
    if (error instanceof Error && error.message.includes('HTML instead of JSON')) {
      throw error;
    }

    console.error(`Error fetching from ${url}:`, error);
    throw error;
  }
}

/**
 * Get site information
 */
export async function getSiteInfo(): Promise<SiteInfo> {
  return fetchAPI('/gaal/v1/site-info');
}

/**
 * Get navigation menu
 */
export async function getMenu(location: string = 'primary'): Promise<MenuItem[]> {
  try {
    return await fetchAPI(`/gaal/v1/menus/${location}`);
  } catch (error) {
    console.error(`Error fetching menu ${location}:`, error);
    return [];
  }
}

/**
 * Get posts with optional parameters
 */
export async function getPosts(params: {
  per_page?: number;
  page?: number;
  categories?: string;
  tags?: string;
  orderby?: string;
  order?: 'asc' | 'desc';
  lang?: string;
} = {}): Promise<WordPressPost[]> {
  const queryParams = new URLSearchParams(
    Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  );

  return fetchAPI(`/wp/v2/posts?${queryParams.toString()}`);
}

/**
 * Get a single post by slug
 */
export async function getPostBySlug(slug: string, lang?: string): Promise<WordPressPost | null> {
  try {
    const langParam = lang ? `&lang=${lang}` : '';
    const posts = await fetchAPI(`/wp/v2/posts?slug=${slug}&_embed${langParam}`);
    return posts[0] || null;
  } catch (error) {
    console.error(`Error fetching post ${slug}:`, error);
    return null;
  }
}

/**
 * Get strategy courses
 */
export async function getStrategyCourses(params: {
  per_page?: number;
  page?: number;
  orderby?: string;
  order?: 'asc' | 'desc';
  strategy_course_categories?: string;
  search?: string;
  lang?: string;
} = {}): Promise<WordPressPost[]> {
  const queryParams = new URLSearchParams(
    Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        // Map strategy_course_categories to the REST API parameter (rest_base)
        if (key === 'strategy_course_categories') {
          acc['strategy-course-categories'] = String(value);
        } else {
          acc[key] = String(value);
        }
      }
      return acc;
    }, {} as Record<string, string>)
  );

  return fetchAPI(`/wp/v2/strategy-courses?${queryParams.toString()}`);
}

/**
 * Get a single strategy course by slug
 */
export async function getStrategyCourseBySlug(slug: string, lang?: string): Promise<WordPressPost | null> {
  try {
    const langParam = lang ? `&lang=${lang}` : '';
    const courses = await fetchAPI(`/wp/v2/strategy-courses?slug=${slug}&_embed${langParam}`);
    return courses[0] || null;
  } catch (error) {
    console.error(`Error fetching strategy course ${slug}:`, error);
    return null;
  }
}

/**
 * Get articles
 */
export async function getArticles(params: {
  per_page?: number;
  page?: number;
  orderby?: string;
  order?: 'asc' | 'desc';
  article_categories?: string;
  tags?: string;
  lang?: string;
} = {}): Promise<WordPressPost[]> {
  const queryParams = new URLSearchParams(
    Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        // Map article_categories to the REST API parameter (rest_base)
        if (key === 'article_categories') {
          acc['article-categories'] = String(value);
        } else {
          acc[key] = String(value);
        }
      }
      return acc;
    }, {} as Record<string, string>)
  );

  return fetchAPI(`/wp/v2/articles?${queryParams.toString()}`);
}

/**
 * Get a single article by slug
 */
export async function getArticleBySlug(slug: string, lang?: string): Promise<WordPressPost | null> {
  try {
    const langParam = lang ? `&lang=${lang}` : '';
    const articles = await fetchAPI(`/wp/v2/articles?slug=${slug}&_embed${langParam}`);
    return articles[0] || null;
  } catch (error) {
    console.error(`Error fetching article ${slug}:`, error);
    return null;
  }
}

/**
 * Get tools
 */
export async function getTools(params: {
  per_page?: number;
  page?: number;
  orderby?: string;
  order?: 'asc' | 'desc';
  tool_categories?: string;
  tags?: string;
  search?: string;
  lang?: string;
} = {}): Promise<WordPressPost[]> {
  const queryParams = new URLSearchParams(
    Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        // Map tool_categories to the REST API parameter (rest_base)
        if (key === 'tool_categories') {
          acc['tool-categories'] = String(value);
        } else {
          acc[key] = String(value);
        }
      }
      return acc;
    }, {} as Record<string, string>)
  );

  return fetchAPI(`/wp/v2/tools?${queryParams.toString()}`);
}

/**
 * Get a single tool by slug
 */
export async function getToolBySlug(slug: string, lang?: string): Promise<WordPressPost | null> {
  try {
    const langParam = lang ? `&lang=${lang}` : '';
    const tools = await fetchAPI(`/wp/v2/tools?slug=${slug}&_embed${langParam}`);
    return tools[0] || null;
  } catch (error) {
    console.error(`Error fetching tool ${slug}:`, error);
    return null;
  }
}

/**
 * Get ordered strategy course steps (courses with steps meta field)
 * Returns courses sorted by steps number (1-20), filtered by language
 */
export async function getOrderedCourseSteps(lang?: string, defaultLang?: string | null): Promise<WordPressPost[]> {
  try {
    // Determine target language: use provided lang, or defaultLang, or null for default
    const targetLang = lang || defaultLang || null;
    
    const allCourses = await getStrategyCourses({
      per_page: 100,
      orderby: 'date',
      order: 'desc',
      lang: targetLang || undefined
    });

    // Filter courses that have a steps meta field, match the target language, and sort by steps number
    const coursesWithSteps = allCourses
      .filter(course => {
        // Must have a steps meta field
        if (course.steps === null || course.steps === undefined || course.steps < 1 || course.steps > 20) {
          return false;
        }
        
        // Filter by language: ensure we only include courses matching the target language
        // If targetLang is null (default language), include posts with null/undefined language
        // If targetLang is set, only include posts matching that language
        if (targetLang === null) {
          // Default language: include posts with null/undefined language
          return course.language === null || course.language === undefined;
        } else {
          // Specific language: only include posts matching that language
          return course.language === targetLang;
        }
      })
      .sort((a, b) => {
        const stepA = a.steps || 0;
        const stepB = b.steps || 0;
        return stepA - stepB;
      });

    return coursesWithSteps;
  } catch (error) {
    console.error('Error fetching ordered course steps:', error);
    return [];
  }
}

/**
 * Get pages
 */
export async function getPages(lang?: string): Promise<WordPressPost[]> {
  const langParam = lang ? `?lang=${lang}` : '';
  return fetchAPI(`/wp/v2/pages${langParam}`);
}

/**
 * Get a single page by slug
 */
export async function getPageBySlug(slug: string, lang?: string): Promise<WordPressPost | null> {
  try {
    const langParam = lang ? `&lang=${lang}` : '';
    const pages = await fetchAPI(`/wp/v2/pages?slug=${slug}&_embed${langParam}`);
    return pages[0] || null;
  } catch (error) {
    console.error(`Error fetching page ${slug}:`, error);
    return null;
  }
}

/**
 * Get categories
 */
export async function getCategories(params: {
  per_page?: number;
  page?: number;
  orderby?: string;
  order?: 'asc' | 'desc';
  hide_empty?: boolean;
  post_type?: string; // Filter by post type (custom implementation needed on WP side if not standard)
} = {}): Promise<Category[]> {
  const queryParams = new URLSearchParams(
    Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  );

  return fetchAPI(`/wp/v2/categories?${queryParams.toString()}`);
}

/**
 * Get article categories
 */
export async function getArticleCategories(params: {
  per_page?: number;
  page?: number;
  orderby?: string;
  order?: 'asc' | 'desc';
  hide_empty?: boolean;
} = {}): Promise<Category[]> {
  const queryParams = new URLSearchParams(
    Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  );

  return fetchAPI(`/wp/v2/article-categories?${queryParams.toString()}`);
}

/**
 * Get tool categories
 */
export async function getToolCategories(params: {
  per_page?: number;
  page?: number;
  orderby?: string;
  order?: 'asc' | 'desc';
  hide_empty?: boolean;
} = {}): Promise<Category[]> {
  const queryParams = new URLSearchParams(
    Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  );

  return fetchAPI(`/wp/v2/tool-categories?${queryParams.toString()}`);
}

/**
 * Get strategy course categories
 */
export async function getStrategyCourseCategories(params: {
  per_page?: number;
  page?: number;
  orderby?: string;
  order?: 'asc' | 'desc';
  hide_empty?: boolean;
} = {}): Promise<Category[]> {
  const queryParams = new URLSearchParams(
    Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  );

  return fetchAPI(`/wp/v2/strategy-course-categories?${queryParams.toString()}`);
}

/**
 * Get tags
 */
export async function getTags(params: {
  per_page?: number;
  page?: number;
  orderby?: string;
  order?: 'asc' | 'desc';
  hide_empty?: boolean;
  post_type?: string;
} = {}): Promise<Tag[]> {
  const queryParams = new URLSearchParams(
    Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  );

  return fetchAPI(`/wp/v2/tags?${queryParams.toString()}`);
}

/**
 * Search strategy courses and tools
 * Returns combined results with type metadata, sorted to prioritize title matches
 */
export interface SearchResult extends WordPressPost {
  resultType: 'strategy-course' | 'tool';
}

export async function searchStrategyCoursesAndTools(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    // Fetch both endpoints in parallel
    const [courses, tools] = await Promise.all([
      getStrategyCourses({
        per_page: 50,
        orderby: 'relevance',
        search: query.trim()
      }).catch(() => [] as WordPressPost[]),
      getTools({
        per_page: 50,
        orderby: 'relevance',
        search: query.trim()
      }).catch(() => [] as WordPressPost[])
    ]);

    // Combine results with type metadata
    const allResults: SearchResult[] = [
      ...courses.map(course => ({ ...course, resultType: 'strategy-course' as const })),
      ...tools.map(tool => ({ ...tool, resultType: 'tool' as const }))
    ];

    // Sort to prioritize title matches over content matches
    const queryLower = query.toLowerCase().trim();
    
    return allResults.sort((a, b) => {
      const aTitle = a.title.rendered.toLowerCase();
      const bTitle = b.title.rendered.toLowerCase();
      
      // Check if title contains the query
      const aTitleMatch = aTitle.includes(queryLower);
      const bTitleMatch = bTitle.includes(queryLower);
      
      // Check if title starts with the query (higher priority)
      const aTitleStarts = aTitle.startsWith(queryLower);
      const bTitleStarts = bTitle.startsWith(queryLower);
      
      // Priority 1: Title starts with query
      if (aTitleStarts && !bTitleStarts) return -1;
      if (!aTitleStarts && bTitleStarts) return 1;
      
      // Priority 2: Title contains query
      if (aTitleMatch && !bTitleMatch) return -1;
      if (!aTitleMatch && bTitleMatch) return 1;
      
      // Priority 3: Both match title or both don't - maintain WordPress relevance order
      // (WordPress orders by relevance when using search parameter)
      return 0;
    });
  } catch (error) {
    console.error('Error searching strategy courses and tools:', error);
    return [];
  }
}

/**
 * Subscribe to newsletter
 */
export async function subscribeToNewsletter(email: string, name?: string): Promise<void> {
  const response = await fetch(`${API_URL}/gaal/v1/newsletter/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      name: name || '',
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data.message || data.code || 'Failed to subscribe to newsletter';
    throw new Error(errorMessage);
  }

  return;
}

/**
 * Render a WordPress shortcode
 * @param shortcode The shortcode string (e.g., '[go_display_opt_in name="Disciple.Tools" source="dt_news"]')
 * @returns The rendered HTML from the shortcode
 */
export async function renderShortcode(shortcode: string): Promise<string> {
  const response = await fetch(`${API_URL}/gaal/v1/shortcode/render`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      shortcode,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data.message || data.code || 'Failed to render shortcode';
    throw new Error(errorMessage);
  }

  return data.html || '';
}

/**
 * Get available languages from Polylang REST API
 */
export async function getLanguages(): Promise<Language[]> {
  try {
    return await fetchAPI('/pll/v1/languages');
  } catch (error) {
    console.error('Error fetching languages:', error);
    return [];
  }
}

/**
 * Get current language from URL path
 * Extracts language code from URL structure: /es/pagename or /pagename (default)
 * @returns Language code (slug) or null if not found/default
 */
export function getCurrentLanguage(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const pathname = window.location.pathname;
  // Remove leading and trailing slashes, then split
  const parts = pathname.replace(/^\/|\/$/g, '').split('/');
  
  // Check if first part is a language code (2-3 characters, common language codes)
  // Common language codes: en, es, fr, de, it, pt, etc.
  if (parts.length > 0 && parts[0].length >= 2 && parts[0].length <= 3) {
    // This is a simple heuristic - in production, you might want to validate
    // against the list of available languages
    return parts[0];
  }
  
  return null; // Default language (no prefix)
}

/**
 * Get default language from Polylang
 */
export async function getDefaultLanguage(): Promise<string | null> {
  try {
    const languages = await getLanguages();
    const defaultLang = languages.find(lang => lang.is_default);
    return defaultLang ? defaultLang.slug : null;
  } catch (error) {
    console.error('Error fetching default language:', error);
    return null;
  }
}

