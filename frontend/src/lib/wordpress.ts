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
  author_info?: {
    name: string;
    avatar: string;
    bio: string;
  };
  categories?: number[];
  tags?: number[];
  steps?: number | null; // Step number meta field for strategy courses
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
export async function getPostBySlug(slug: string): Promise<WordPressPost | null> {
  try {
    const posts = await fetchAPI(`/wp/v2/posts?slug=${slug}&_embed`);
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
export async function getStrategyCourseBySlug(slug: string): Promise<WordPressPost | null> {
  try {
    const courses = await fetchAPI(`/wp/v2/strategy-courses?slug=${slug}&_embed`);
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
export async function getArticleBySlug(slug: string): Promise<WordPressPost | null> {
  try {
    const articles = await fetchAPI(`/wp/v2/articles?slug=${slug}&_embed`);
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
export async function getToolBySlug(slug: string): Promise<WordPressPost | null> {
  try {
    const tools = await fetchAPI(`/wp/v2/tools?slug=${slug}&_embed`);
    return tools[0] || null;
  } catch (error) {
    console.error(`Error fetching tool ${slug}:`, error);
    return null;
  }
}

/**
 * Get ordered strategy course steps (courses with steps meta field)
 * Returns courses sorted by steps number (1-20)
 */
export async function getOrderedCourseSteps(): Promise<WordPressPost[]> {
  try {
    const allCourses = await getStrategyCourses({
      per_page: 100,
      orderby: 'date',
      order: 'desc'
    });

    // Filter courses that have a steps meta field and sort by steps number
    const coursesWithSteps = allCourses
      .filter(course => course.steps !== null && course.steps !== undefined && course.steps >= 1 && course.steps <= 20)
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
export async function getPages(): Promise<WordPressPost[]> {
  return fetchAPI('/wp/v2/pages');
}

/**
 * Get a single page by slug
 */
export async function getPageBySlug(slug: string): Promise<WordPressPost | null> {
  try {
    const pages = await fetchAPI(`/wp/v2/pages?slug=${slug}&_embed`);
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

