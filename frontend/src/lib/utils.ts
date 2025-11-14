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
 * Strip HTML tags from string
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
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

