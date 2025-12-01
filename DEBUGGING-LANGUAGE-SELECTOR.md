# Debugging Language Selector Visibility

## Quick Checklist

The language selector should now **always be visible** in the upper right menu. If you don't see it, follow these steps:

### 1. Check Browser Console

Open browser DevTools (F12) and check the Console tab for:

- ✅ `LanguageSelector: Component mounted` - Confirms component is rendering
- ✅ `LanguageSelector: Loaded languages` - Shows what languages were found
- ✅ `LanguageSelector: Default language` - Shows default language code

**If you see errors:**
- Check Network tab for failed requests to `/wp-json/pll/v1/languages`
- Verify Polylang plugin is active
- Check if REST API is accessible

### 2. Visual States

The language selector will show different states:

**Loading State:**
- Globe icon with pulsing animation
- Shows "..." text
- Gray color, disabled

**No Languages:**
- Globe icon
- Shows "--" text
- Gray background, disabled
- Tooltip: "No languages configured in Polylang"

**Single Language:**
- Globe icon
- Shows language code (e.g., "EN")
- Gray background, disabled
- Tooltip: "Only one language configured"

**Multiple Languages (Working):**
- Globe icon
- Shows current language code (e.g., "EN" or "ES")
- Clickable, opens dropdown
- Hover effect

### 3. Check Component Location

The language selector should appear:
- **Desktop:** Between Search icon and Login icon in the top menu bar
- **Mobile:** In the mobile menu header (top right, before hamburger menu)

### 4. Verify Polylang Configuration

Run the test script:
```bash
wp eval-file cli/test-polylang-endpoints.php
```

Expected output:
- ✅ Polylang is active
- ✅ Languages found (at least 1)
- ✅ REST API endpoint working

### 5. Manual Browser Test

Open these URLs directly:

**Test Languages API:**
```
https://ai.kingdom.training/wp-json/pll/v1/languages
```

Should return JSON array. If empty `[]`, add languages in Polylang settings.

**Test if component is rendering:**
1. Open browser DevTools
2. Go to Elements/Inspector tab
3. Search for "LanguageSelector" or "Globe"
4. Check if element exists in DOM

### 6. Common Issues & Solutions

#### Issue: Component not in DOM at all
**Symptoms:** No element found when searching DOM

**Solution:**
1. Check if Header component is rendering
2. Verify no JavaScript errors preventing render
3. Check browser console for React errors
4. Rebuild frontend: `cd frontend && npm run build`

#### Issue: Component renders but is invisible
**Symptoms:** Element exists in DOM but not visible

**Solution:**
1. Check CSS - element might have `display: none` or `visibility: hidden`
2. Check z-index conflicts
3. Verify parent container has proper flex/display properties
4. Check for CSS conflicts with Tailwind classes

#### Issue: Shows "--" or single language code
**Symptoms:** Selector visible but disabled

**Solution:**
1. Add second language in Polylang settings
2. Verify REST API returns multiple languages
3. Check console for "LanguageSelector: Only one language configured"

#### Issue: Shows "..." (loading forever)
**Symptoms:** Stuck in loading state

**Solution:**
1. Check Network tab for `/wp-json/pll/v1/languages` request
2. Verify request completes (not pending)
3. Check for CORS errors
4. Verify REST API is accessible

### 7. Force Visibility Test

To verify the component is definitely rendering, temporarily add this to see a test button:

The component now always renders something, so you should see:
- Globe icon + text (even if disabled)
- In the upper right menu area
- Between Search and Login icons

### 8. Network Debugging

Check Network tab in DevTools:

1. Filter by "pll" or "languages"
2. Look for request to `/wp-json/pll/v1/languages`
3. Check:
   - Status code (should be 200)
   - Response (should be JSON array)
   - Headers (should include CORS headers)

### 9. React DevTools

If you have React DevTools installed:

1. Open React DevTools
2. Find `LanguageSelector` component
3. Check props and state
4. Verify `languages` array has data
5. Check `loading` state

### 10. Rebuild Frontend

If changes aren't showing:

```bash
cd frontend
npm run build
# or for development
npm run dev
```

Then refresh browser with hard reload (Cmd+Shift+R or Ctrl+Shift+R)

## Expected Behavior

When everything is working:

1. **Component is visible** - Globe icon + language code in upper right
2. **Console shows logs** - Component mount and language loading
3. **Network request succeeds** - `/pll/v1/languages` returns data
4. **Clickable dropdown** - If 2+ languages, clicking shows dropdown
5. **Language switching works** - Selecting language changes URL and content

## Still Not Visible?

If the component is still not visible after checking all above:

1. **Check if Header is rendering** - Look for logo, menu items
2. **Check for CSS conflicts** - Inspect element, check computed styles
3. **Check React errors** - Look for red errors in console
4. **Check build output** - Verify LanguageSelector is included in bundle
5. **Check import path** - Verify `@/components/LanguageSelector` resolves correctly

## Quick Test Commands

```bash
# Test Polylang endpoints
wp eval-file cli/test-polylang-endpoints.php

# Check if Polylang is active
wp eval 'echo function_exists("pll_get_post_language") ? "Active" : "Not Active";'

# List languages
wp eval 'if(function_exists("PLL")) { $langs = PLL()->model->get_languages_list(); foreach($langs as $l) echo $l->name . " (" . $l->slug . ")\n"; } else echo "Polylang not active\n";'
```

