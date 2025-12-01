# Translation System Documentation

## Overview

This theme implements a comprehensive translation system for frontend UI strings using Polylang's string translation feature. All navigation labels, buttons, and UI text that are not stored in the WordPress database can now be translated through the WordPress admin interface.

## Architecture

### Backend (PHP)
- **String Registration**: All UI strings are registered with Polylang using `pll_register_string()` in `functions.php`
- **REST API Endpoint**: `/wp-json/gaal/v1/translations?lang={lang_code}` returns all translations for a specific language
- **Translation Management**: Translations are managed in WordPress Admin > Languages > String translations

### Frontend (React)
- **Translation Library**: `frontend/src/lib/translations.ts` - Fetches and caches translations
- **React Hook**: `frontend/src/hooks/useTranslation.ts` - Provides `t()` function for components
- **Component Integration**: Components use `useTranslation()` hook to access translated strings

## How to Use

### For Developers

#### 1. Using Translations in Components

```tsx
import { useTranslation } from '@/hooks/useTranslation';

export default function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('nav_home')}</h1>
      <button>{t('ui_read_more')}</button>
    </div>
  );
}
```

#### 2. Translations with Placeholders

```tsx
const { t, tWithReplace } = useTranslation();

// Replace placeholders like {count}
const text = tWithReplace('page_step_curriculum', { count: 10 });
// Returns: "The 10-Step Curriculum:"
```

#### 3. Adding New Strings

1. **Register in PHP** (`functions.php`):
```php
pll_register_string('my_new_string', 'My English Text', 'Frontend UI');
```

2. **Add to REST API** (`functions.php` - in `gaal_register_translations_api()`):
```php
'my_new_string' => pll_translate_string('My English Text', $lang),
```

3. **Add to TypeScript** (`frontend/src/lib/translations.ts`):
```typescript
export interface Translations {
  // ... existing strings
  my_new_string: string;
}
```

4. **Add default fallback** (`frontend/src/lib/translations.ts` - in `getDefaultTranslations()`):
```typescript
my_new_string: 'My English Text',
```

5. **Use in components**:
```tsx
const { t } = useTranslation();
<span>{t('my_new_string')}</span>
```

### For Translators

#### Managing Translations in WordPress Admin

1. Go to **WordPress Admin > Languages > String translations**
2. Find the string group **"Frontend UI"**
3. Enter translations for each language
4. Click **Save translations**

#### Available String Groups

- **Frontend UI**: All navigation, buttons, and UI text strings

## Available Translation Keys

### Navigation
- `nav_home` - "Home"
- `nav_articles` - "Articles"
- `nav_tools` - "Tools"
- `nav_strategy_course` - "Strategy Course"
- `nav_strategy_courses` - "Strategy Courses"
- `nav_newsletter` - "Newsletter"
- `nav_search` - "Search"
- `nav_login` - "Login"
- `nav_menu` - "Menu"
- `nav_about` - "About"

### Common UI
- `ui_read_more` - "Learn more"
- `ui_view_all` - "View all"
- `ui_browse_all` - "Browse all"
- `ui_back_to` - "Back to"
- `ui_explore` - "Explore"
- `ui_read_articles` - "Read Articles"
- `ui_explore_tools` - "Explore Tools"
- `ui_select_language` - "Select Language"
- `ui_close` - "Close"
- `ui_loading` - "Loading..."

### Page Headers
- `page_latest_articles` - "Latest Articles"
- `page_featured_tools` - "Featured Tools"
- `page_key_information` - "Key Information About Media to Disciple Making Movements"
- `page_mvp_strategy_course` - "The MVP: Strategy Course"
- `page_start_strategy_course` - "Start Your Strategy Course"
- `page_step_curriculum` - "The {count}-Step Curriculum:" (supports {count} placeholder)

### Content Messages
- `msg_no_articles` - "Articles will appear here once content is added to WordPress."
- `msg_no_tools` - "Tools will appear here once content is added to WordPress."
- `msg_no_content` - "No content found."
- `msg_discover_supplementary` - "Discover supplementary tools and resources..."
- `msg_discover_more` - "Discover more articles and resources..."

### Footer
- `footer_quick_links` - "Quick Links"
- `footer_our_vision` - "Our Vision"
- `footer_subscribe` - "Subscribe to Newsletter"
- `footer_privacy_policy` - "Privacy Policy"
- `footer_all_rights` - "All rights reserved."

### Newsletter
- `newsletter_subscribe` - "Subscribe"
- `newsletter_email_placeholder` - "Enter your email"
- `newsletter_name_placeholder` - "Enter your name"
- `newsletter_success` - "Successfully subscribed!"
- `newsletter_error` - "Failed to subscribe. Please try again."

### Search
- `search_placeholder` - "Search..."
- `search_no_results` - "No results found"
- `search_results` - "Search Results"

### Breadcrumbs
- `breadcrumb_home` - "Home"
- `breadcrumb_articles` - "Articles"
- `breadcrumb_tools` - "Tools"
- `breadcrumb_strategy_courses` - "Strategy Courses"

### Hero
- `hero_explore_resources` - "Explore Our Resources"
- `hero_about_us` - "About Us"

## Technical Details

### Translation Caching

Translations are cached in memory to avoid repeated API calls. The cache is automatically cleared when the language changes (detected via URL path).

### Fallback Behavior

If translations fail to load or a key is missing:
1. The system falls back to default English translations
2. If a specific key is missing, it returns the key name itself
3. Errors are logged to the browser console

### Language Detection

The translation system automatically detects the current language from the URL path:
- `/es/articles` → Spanish (es)
- `/articles` → Default language (usually English)

### API Endpoint

**GET** `/wp-json/gaal/v1/translations?lang={lang_code}`

**Response:**
```json
{
  "success": true,
  "language": "es",
  "translations": {
    "nav_home": "Inicio",
    "nav_articles": "Artículos",
    ...
  }
}
```

## Testing

### Test Translation Endpoint

```bash
# Test English translations
curl https://your-site.com/wp-json/gaal/v1/translations?lang=en

# Test Spanish translations
curl https://your-site.com/wp-json/gaal/v1/translations?lang=es
```

### Verify in Browser

1. Open browser DevTools Console
2. Navigate to a page with translations
3. Check for any translation loading errors
4. Verify translations appear correctly when switching languages

## Troubleshooting

### Translations Not Loading

1. **Check Polylang is active**: Verify Polylang plugin is installed and activated
2. **Check REST API**: Test `/wp-json/gaal/v1/translations` endpoint directly
3. **Check browser console**: Look for fetch errors or CORS issues
4. **Verify strings registered**: Go to Languages > String translations and verify strings appear

### Translations Not Updating

1. **Clear browser cache**: Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
2. **Check Polylang cache**: Translations are cached - wait a moment or clear WordPress cache
3. **Verify language code**: Ensure the language code matches Polylang's slug (e.g., "es" not "es_ES")

### Missing Translations

1. **Check string registration**: Verify string is registered in `functions.php`
2. **Check REST API**: Verify string appears in API response
3. **Check TypeScript types**: Ensure key is added to `Translations` interface
4. **Check default fallback**: Verify default English text is in `getDefaultTranslations()`

## Future Enhancements

Potential improvements:
- Add pluralization support
- Add context-aware translations
- Add translation versioning
- Add translation import/export
- Add translation progress tracking

