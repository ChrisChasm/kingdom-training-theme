/**
 * SEO Component
 * Comprehensive SEO meta tags including Open Graph and Twitter Cards
 */

import { Helmet } from 'react-helmet-async';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

const defaultTitle = 'Kingdom.Training - Media to Disciple Making Movements';
const defaultDescription = 'Training disciple makers to use media to accelerate Disciple Making Movements. Equipping practitioners with practical strategies that bridge online engagement with face-to-face discipleship.';
const defaultKeywords = 'disciple making movements, media, digital discipleship, M2DMM, kingdom training, evangelism, church planting, online ministry, face-to-face discipleship, unreached peoples';
const defaultImage = '/kt-logo-header.webp';
const siteName = 'Kingdom.Training';

/**
 * Get the full URL for the current page
 */
function getFullUrl(path: string = ''): string {
  if (typeof window === 'undefined') {
    return '';
  }
  
  const baseUrl = window.location.origin;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Get the full image URL
 */
function getFullImageUrl(image: string | undefined): string {
  if (!image) {
    // Use default image - check if we're in WordPress or dev environment
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const isProduction = hostname === 'ai.kingdom.training' || hostname.includes('kingdom.training');
      
      if (isProduction) {
        // Production WordPress - use full theme path
        return `${window.location.origin}/wp-content/themes/kingdom-training-theme/dist/kt-logo-header.webp`;
      }
    }
    return getFullUrl(defaultImage);
  }
  
  // If image is already a full URL (http/https), return it as is
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }
  
  // If image is a WordPress URL path (wp-content), make it absolute
  if (image.includes('wp-content')) {
    if (image.startsWith('/')) {
      // Already absolute path
      return typeof window !== 'undefined' ? `${window.location.origin}${image}` : image;
    }
    return image; // Assume it's already a full URL if it contains wp-content but doesn't start with /
  }
  
  // Otherwise, make it a full URL
  return getFullUrl(image);
}

export default function SEO({
  title,
  description = defaultDescription,
  keywords = defaultKeywords,
  image,
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  noindex = false,
  nofollow = false,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const fullUrl = url ? getFullUrl(url) : (typeof window !== 'undefined' ? window.location.href : '');
  const fullImageUrl = getFullImageUrl(image);
  
  // Build robots meta
  const robots = [];
  if (noindex) robots.push('noindex');
  if (nofollow) robots.push('nofollow');
  if (robots.length === 0) robots.push('index', 'follow');
  const robotsContent = robots.join(', ');

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author || siteName} />
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />
      
      {/* Article-specific Open Graph tags */}
      {type === 'article' && (
        <>
          {author && <meta property="article:author" content={author} />}
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
        </>
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:site" content="@kingdomtraining" />
      <meta name="twitter:creator" content={author || '@kingdomtraining'} />
    </Helmet>
  );
}

