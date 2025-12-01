# Testing Multilingual Support

## Quick Test Guide

### 1. Test Polylang REST API Endpoints

Run the test script to verify Polylang is working:

```bash
wp eval-file cli/test-polylang-endpoints.php
```

This will test:
- ✅ Polylang plugin activation
- ✅ Language configuration
- ✅ REST API endpoint `/pll/v1/languages`
- ✅ Language fields on posts
- ✅ Language filtering

### 2. Test REST API Endpoints in Browser

Open these URLs in your browser (replace `ai.kingdom.training` with your domain):

#### Test Polylang Languages Endpoint
```
https://ai.kingdom.training/wp-json/pll/v1/languages
```

Expected response: Array of language objects with `slug`, `name`, `is_default`, etc.

#### Test Posts with Language Fields
```
https://ai.kingdom.training/wp-json/wp/v2/posts?per_page=1&_fields=id,title,language,translations
```

Expected response: Post object with `language` and `translations` fields.

#### Test Language Filtering
```
https://ai.kingdom.training/wp-json/wp/v2/posts?lang=es&per_page=5
```

Expected response: Only posts in Spanish (or empty array if none exist).

#### Test Custom Post Types with Language
```
https://ai.kingdom.training/wp-json/wp/v2/articles?per_page=1&_fields=id,title,language,translations
https://ai.kingdom.training/wp-json/wp/v2/tools?per_page=1&_fields=id,title,language,translations
https://ai.kingdom.training/wp-json/wp/v2/strategy-courses?per_page=1&_fields=id,title,language,translations
```

### 3. Test with cURL

```bash
# Test languages endpoint
curl https://ai.kingdom.training/wp-json/pll/v1/languages

# Test posts with language
curl "https://ai.kingdom.training/wp-json/wp/v2/posts?per_page=1&_fields=id,title,language,translations"

# Test language filtering
curl "https://ai.kingdom.training/wp-json/wp/v2/posts?lang=es&per_page=5"
```

### 4. Test Frontend Language Selector

1. **Open browser console** (F12 or Cmd+Option+I)
2. **Navigate to your site** (e.g., `https://ai.kingdom.training`)
3. **Check console logs** for:
   - `LanguageSelector: Loaded languages` - Should show array of languages
   - `LanguageSelector: Default language` - Should show default language code
   - Any error messages

4. **Check Network tab**:
   - Look for request to `/wp-json/pll/v1/languages`
   - Check response status and data

## Troubleshooting Language Selector

### Language Selector Not Showing?

The selector will only show if:
1. ✅ Polylang plugin is active
2. ✅ At least 2 languages are configured
3. ✅ REST API endpoint `/pll/v1/languages` returns data

### Common Issues

#### Issue 1: "No languages found"
**Symptoms:** Console shows "LanguageSelector: No languages found"

**Solution:**
1. Go to WordPress Admin > Languages > Languages
2. Add at least 2 languages (e.g., English and Spanish)
3. Set one as default
4. Refresh the frontend

#### Issue 2: "Only one language configured"
**Symptoms:** Console shows "LanguageSelector: Only one language configured"

**Solution:**
- Add a second language in Polylang settings
- The selector will appear automatically

#### Issue 3: REST API returns 404
**Symptoms:** Network tab shows 404 for `/wp-json/pll/v1/languages`

**Solution:**
1. Verify Polylang plugin is active: `wp plugin list | grep polylang`
2. Check if REST API is enabled: Visit `/wp-json/` - should show API index
3. Flush rewrite rules: Go to Settings > Permalinks > Save Changes

#### Issue 4: Language fields not in REST API
**Symptoms:** Posts don't have `language` or `translations` fields

**Solution:**
1. Verify Polylang is active (check `functions.php` checks for `pll_get_post_language`)
2. Check if posts have languages assigned in WordPress admin
3. Test with: `wp eval-file cli/test-polylang-endpoints.php`

### Debug Steps

1. **Check Polylang Configuration:**
   ```bash
   wp eval 'var_dump(function_exists("pll_get_post_language"));'
   ```

2. **Check Languages:**
   ```bash
   wp eval 'if(function_exists("PLL")) { $langs = PLL()->model->get_languages_list(); foreach($langs as $l) echo $l->name . " (" . $l->slug . ")\n"; }'
   ```

3. **Check REST API:**
   ```bash
   curl -I https://ai.kingdom.training/wp-json/pll/v1/languages
   ```

4. **Check Browser Console:**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for LanguageSelector logs
   - Check for any errors

5. **Check Network Requests:**
   - Open DevTools > Network tab
   - Filter by "pll" or "languages"
   - Check if request succeeds and returns data

## Expected Behavior

### When Working Correctly:

1. **Language Selector:**
   - Shows in upper right of header (desktop)
   - Shows current language code (e.g., "EN" or "ES")
   - Clicking shows dropdown with all languages
   - Selecting a language switches the page

2. **REST API:**
   - `/pll/v1/languages` returns array of language objects
   - Posts include `language` field (string)
   - Posts include `translations` field (array)
   - `?lang=es` parameter filters content

3. **URLs:**
   - Default language: `/articles` (no prefix)
   - Other languages: `/es/articles` (with prefix)
   - Language persists when navigating

## Next Steps After Testing

Once endpoints are working:

1. **Create translations:**
   - Go to WordPress Admin
   - Edit a post/page
   - Use Polylang's translation interface to link translations

2. **Test language switching:**
   - Click language selector
   - Verify URL changes
   - Verify content changes (if translations exist)

3. **Test API filtering:**
   - Use `?lang=es` parameter in API calls
   - Verify only Spanish content is returned

