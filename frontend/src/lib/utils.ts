/**
 * Utility functions
 */

import { type ClassValue, clsx } from 'clsx';

/**
 * Merge class names
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Strip HTML tags from string and decode HTML entities
 */
export function stripHtml(html: string): string {
  // First strip HTML tags
  const text = html.replace(/<[^>]*>/g, '');
  
  // Then decode HTML entities using browser's built-in parser
  // This handles entities like &#8217; (apostrophe), &#8230; (ellipsis), &amp; (ampersand), etc.
  if (typeof document !== 'undefined') {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  }
  
  // Fallback for server-side rendering (basic entity decoding)
  // This handles the most common entities
  return text
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8230;/g, '...')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * Truncate text to a certain length
 */
export function truncate(text: string, length: number = 150): string {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + '...';
}

/**
 * Format date
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Get reading time estimate
 */
export function getReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Course Progress Tracking
 * Manages course step completion using localStorage
 */

const STORAGE_KEY = 'strategy_course_progress';

/**
 * Get all completed course step slugs from localStorage
 */
export function getCompletedSteps(): Set<string> {
  if (typeof window === 'undefined') {
    return new Set();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const steps = JSON.parse(stored) as string[];
      return new Set(steps);
    }
  } catch (error) {
    console.error('Error reading course progress from localStorage:', error);
  }

  return new Set();
}

/**
 * Mark a course step as completed by slug
 */
export function markStepCompleted(slug: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const completed = getCompletedSteps();
    completed.add(slug);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(completed)));
    
    // Dispatch custom event to notify components of progress update
    window.dispatchEvent(new Event('courseProgressUpdated'));
  } catch (error) {
    console.error('Error saving course progress to localStorage:', error);
  }
}

/**
 * Check if a course step is completed
 */
export function isStepCompleted(slug: string): boolean {
  const completed = getCompletedSteps();
  return completed.has(slug);
}

/**
 * Get progress percentage for a list of course steps
 */
export function getProgressPercentage(stepSlugs: string[]): number {
  if (stepSlugs.length === 0) return 0;
  
  const completed = getCompletedSteps();
  const completedCount = stepSlugs.filter(slug => completed.has(slug)).length;
  
  return Math.round((completedCount / stepSlugs.length) * 100);
}

/**
 * Get completed count for a list of course steps
 */
export function getCompletedCount(stepSlugs: string[]): number {
  const completed = getCompletedSteps();
  return stepSlugs.filter(slug => completed.has(slug)).length;
}

/**
 * Clear all course progress (useful for testing or reset)
 */
export function clearCourseProgress(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing course progress from localStorage:', error);
  }
}

/**
 * Convert a number (1-20) to its word representation
 */
export function numberToWord(num: number): string {
  const words = [
    'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'
  ];
  
  if (num >= 1 && num <= 20) {
    return words[num];
  }
  
  return num.toString();
}

/**
 * Get theme asset URL
 * Returns the full path to an asset in the theme's dist directory
 * Works in both WordPress and development environments
 */
export function getThemeAssetUrl(filename: string): string {
  if (typeof window === 'undefined') {
    // Server-side or build time - return relative path
    return `/${filename}`;
  }
  
  // In browser - check if we're on the WordPress domain
  const hostname = window.location.hostname;
  const isProduction = hostname === 'ai.kingdom.training' || hostname.includes('kingdom.training');
  
  if (isProduction) {
    // Production WordPress - use full theme path
    return '/wp-content/themes/kingdom-training-theme/dist/' + filename;
  }
  
  // Development mode - use relative path (Vite will serve from public folder)
  return `/${filename}`;
}

