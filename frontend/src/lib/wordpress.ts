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

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
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
} = {}): Promise<WordPressPost[]> {
  const queryParams = new URLSearchParams(
    Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = String(value);
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
} = {}): Promise<WordPressPost[]> {
  const queryParams = new URLSearchParams(
    Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = String(value);
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
} = {}): Promise<WordPressPost[]> {
  const queryParams = new URLSearchParams(
    Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = String(value);
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

