/**
 * Translation System for Frontend UI Strings
 * Fetches translations from WordPress REST API and provides translation functions
 */

const API_URL = typeof window !== 'undefined' 
  ? '/wp-json' 
  : (import.meta.env.VITE_WORDPRESS_API_URL || 'http://localhost:8888/wp-json');

export interface Translations {
  // Navigation
  nav_home: string;
  nav_articles: string;
  nav_tools: string;
  nav_strategy_course: string;
  nav_strategy_courses: string;
  nav_newsletter: string;
  nav_search: string;
  nav_login: string;
  nav_menu: string;
  nav_about: string;

  // Common UI
  ui_read_more: string;
  ui_view_all: string;
  ui_browse_all: string;
  ui_back_to: string;
  ui_explore: string;
  ui_read_articles: string;
  ui_explore_tools: string;
  ui_select_language: string;
  ui_close: string;
  ui_loading: string;

  // Page Headers
  page_latest_articles: string;
  page_featured_tools: string;
  page_key_information: string;
  page_mvp_strategy_course: string;
  page_start_strategy_course: string;
  page_step_curriculum: string;

  // Content Messages
  msg_no_articles: string;
  msg_no_tools: string;
  msg_no_content: string;
  msg_discover_supplementary: string;
  msg_discover_more: string;

  // Footer
  footer_quick_links: string;
  footer_our_vision: string;
  footer_subscribe: string;
  footer_privacy_policy: string;
  footer_all_rights: string;

  // Newsletter
  newsletter_subscribe: string;
  newsletter_email_placeholder: string;
  newsletter_name_placeholder: string;
  newsletter_success: string;
  newsletter_error: string;

  // Search
  search_placeholder: string;
  search_no_results: string;
  search_results: string;

  // Breadcrumbs
  breadcrumb_home: string;
  breadcrumb_articles: string;
  breadcrumb_tools: string;
  breadcrumb_strategy_courses: string;

  // Hero
  hero_explore_resources: string;
  hero_about_us: string;
  hero_description: string;

  // Homepage Content (longer text chunks)
  home_mvp_description: string;
  home_newsletter_description: string;
  home_heavenly_economy: string;
  home_mission_statement: string;
  home_loading_steps: string;
}

// Cache for translations
let translationsCache: Translations | null = null;
let currentLanguage: string | null = null;

/**
 * Fetch translations for a specific language
 */
export async function fetchTranslations(lang?: string | null): Promise<Translations> {
  // Use cached translations if language hasn't changed
  if (translationsCache && currentLanguage === lang) {
    return translationsCache;
  }

  try {
    const langParam = lang ? `?lang=${lang}` : '';
    const response = await fetch(`${API_URL}/gaal/v1/translations${langParam}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch translations: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.translations) {
      translationsCache = data.translations as Translations;
      currentLanguage = lang || null;
      return translationsCache;
    }

    throw new Error('Invalid translation response format');
  } catch (error) {
    console.error('Error fetching translations:', error);
    
    // Return default English translations as fallback
    return getDefaultTranslations();
  }
}

/**
 * Get default English translations (fallback)
 */
function getDefaultTranslations(): Translations {
  return {
    nav_home: 'Home',
    nav_articles: 'Articles',
    nav_tools: 'Tools',
    nav_strategy_course: 'Strategy Course',
    nav_strategy_courses: 'Strategy Courses',
    nav_newsletter: 'Newsletter',
    nav_search: 'Search',
    nav_login: 'Login',
    nav_menu: 'Menu',
    nav_about: 'About',
    ui_read_more: 'Learn more',
    ui_view_all: 'View all',
    ui_browse_all: 'Browse all',
    ui_back_to: 'Back to',
    ui_explore: 'Explore',
    ui_read_articles: 'Read Articles',
    ui_explore_tools: 'Explore Tools',
    ui_select_language: 'Select Language',
    ui_close: 'Close',
    ui_loading: 'Loading...',
    page_latest_articles: 'Latest Articles',
    page_featured_tools: 'Featured Tools',
    page_key_information: 'Key Information About Media to Disciple Making Movements',
    page_mvp_strategy_course: 'The MVP: Strategy Course',
    page_start_strategy_course: 'Start Your Strategy Course',
    page_step_curriculum: 'The {count}-Step Curriculum:',
    msg_no_articles: 'Articles will appear here once content is added to WordPress.',
    msg_no_tools: 'Tools will appear here once content is added to WordPress.',
    msg_no_content: 'No content found.',
    msg_discover_supplementary: 'Discover supplementary tools and resources to enhance your M2DMM strategy development and practice.',
    msg_discover_more: 'Discover more articles and resources to deepen your understanding and enhance your M2DMM practice.',
    footer_quick_links: 'Quick Links',
    footer_our_vision: 'Our Vision',
    footer_subscribe: 'Subscribe to Newsletter',
    footer_privacy_policy: 'Privacy Policy',
    footer_all_rights: 'All rights reserved.',
    newsletter_subscribe: 'Subscribe',
    newsletter_email_placeholder: 'Enter your email',
    newsletter_name_placeholder: 'Enter your name',
    newsletter_success: 'Successfully subscribed!',
    newsletter_error: 'Failed to subscribe. Please try again.',
    search_placeholder: 'Search...',
    search_no_results: 'No results found',
    search_results: 'Search Results',
    breadcrumb_home: 'Home',
    breadcrumb_articles: 'Articles',
    breadcrumb_tools: 'Tools',
    breadcrumb_strategy_courses: 'Strategy Courses',
    hero_explore_resources: 'Explore Our Resources',
    hero_about_us: 'About Us',
    hero_description: 'Accelerate your disciple making with strategic use of media, advertising, and AI tools. Kingdom.Training is a resource for disciple makers to use media to accelerate Disciple Making Movements.',
    home_mvp_description: 'Our flagship course guides you through 10 core elements needed to craft a Media to Disciple Making Movements strategy for any context. Complete your plan in 6-7 hours.',
    home_newsletter_description: 'Field driven tools and articles for disciple makers.',
    home_heavenly_economy: 'We operate within what we call the "Heavenly Economy"—a principle that challenges the broken world\'s teaching that "the more you get, the more you should keep." Instead, we reflect God\'s generous nature by offering free training, hands-on coaching, and open-source tools like Disciple.Tools.',
    home_mission_statement: 'Our heart beats with passion for the unreached and least-reached peoples of the world. Every course, article, and tool serves the ultimate vision of seeing Disciple Making Movements catalyzed among people groups where the name of Jesus has never been proclaimed.',
    home_loading_steps: 'Loading course steps...',
  };
}

/**
 * Clear translation cache (useful when language changes)
 */
export function clearTranslationCache() {
  translationsCache = null;
  currentLanguage = null;
}

