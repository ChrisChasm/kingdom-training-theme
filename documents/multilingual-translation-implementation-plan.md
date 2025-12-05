# Multilingual Translation Automation - Implementation Plan

## Overview

This document outlines the step-by-step implementation plan for the Multilingual Translation Automation feature. The implementation is broken down into phases, with each phase building upon the previous one.

## Implementation Phases

### Phase 1: Foundation & Configuration (Week 1)

#### 1.1 Admin Settings Page
**Priority**: High  
**Estimated Time**: 4-6 hours

**Tasks**:
- [ ] Create admin settings page at `Settings → Translation Automation`
- [ ] Add form fields for:
  - Google Translate API Key
  - LLM API Endpoint URL (OpenAI-compatible)
  - LLM API Key
  - LLM Model Name
  - Enabled languages (checkboxes)
  - Default post status for translations
- [ ] Implement settings save functionality
- [ ] Add validation for API keys and URLs
- [ ] Add help text and documentation links
- [ ] Add provider presets (OpenAI, Anthropic, Google Gemini) with auto-filled endpoints

**Files to Create/Modify**:
- `functions.php` - Add settings page functions
- Consider creating `includes/admin-translation-settings.php` for organization

**Code Structure**:
```php
// Settings page registration
function gaal_add_translation_settings_page() { ... }
add_action('admin_menu', 'gaal_add_translation_settings_page');

// Settings page callback
function gaal_translation_settings_page() { ... }

// Save settings
function gaal_save_translation_settings() { ... }
add_action('admin_init', 'gaal_save_translation_settings');
```

**Provider Presets** (for easier configuration):
- OpenAI: `https://api.openai.com/v1`
- Anthropic Claude: `https://api.anthropic.com/v1`
- Google Gemini: `https://generativelanguage.googleapis.com/v1` (if OpenAI-compatible endpoint available)
- Custom: User-entered URL

#### 1.2 API Integration Classes
**Priority**: High  
**Estimated Time**: 6-8 hours

**Tasks**:
- [ ] Create `GAAL_Translation_API` base class
- [ ] Create `GAAL_Google_Translate_API` class
  - Implement `translate()` method
  - Handle API authentication
  - Handle rate limiting
  - Error handling
- [ ] Create `GAAL_LLM_API` class (OpenAI-compatible)
  - Implement `evaluate_translation()` method
  - Implement `improve_translation()` method
  - Use OpenAI chat completions format (`/v1/chat/completions`)
  - Handle API authentication (Bearer token)
  - Support configurable endpoint URL and model
  - Error handling
  - Provider-agnostic implementation (works with OpenAI, Claude, Gemini, etc.)
- [ ] Add helper methods for content extraction and processing
- [ ] Implement OpenAI-compatible request/response format
  - Request: `POST {endpoint}/chat/completions`
  - Headers: `Authorization: Bearer {api_key}`, `Content-Type: application/json`
  - Optional provider-specific headers (e.g., Anthropic version header)
  - Body: `{ "model": "...", "messages": [...], "temperature": 0.7, "max_tokens": 4000 }`
  - Response: Handle standard OpenAI response format
  - Extract content from `response.choices[0].message.content`
- [ ] Implement provider detection/adapter logic
  - Detect provider from endpoint URL
  - Apply provider-specific headers if needed
  - Handle provider-specific response variations
  - Fallback to standard OpenAI format

**Files to Create**:
- `includes/class-gaal-translation-api.php` (base class)
- `includes/class-gaal-google-translate-api.php`
- `includes/class-gaal-llm-api.php` (OpenAI-compatible, provider-agnostic)

**Dependencies**:
- Google Cloud Translation API PHP client library (or custom HTTP implementation)
- cURL or WordPress HTTP API (for LLM API calls)
- No specific LLM SDK required (uses standard HTTP requests with OpenAI format)

#### 1.3 Translation Job Management
**Priority**: High  
**Estimated Time**: 4-6 hours

**Tasks**:
- [ ] Create `GAAL_Translation_Job` class
  - Job creation and initialization
  - Status tracking (pending, in_progress, completed, failed)
  - Progress tracking (languages completed)
  - Job data storage in post meta
  - Job resumption logic
- [ ] Implement job status getters/setters
- [ ] Add methods to serialize/deserialize job data

**Files to Create**:
- `includes/class-gaal-translation-job.php`

**Post Meta Fields**:
- `_translation_job_status`
- `_translation_job_progress`
- `_translation_job_data`
- `_translation_source_post_id`
- `_translation_last_updated`

### Phase 2: Core Translation Engine (Week 2)

#### 2.1 Content Extraction & Processing
**Priority**: High  
**Estimated Time**: 4-6 hours

**Tasks**:
- [ ] Create content extraction functions
  - Extract title, content, excerpt from post
  - Preserve HTML structure
  - Handle special content (shortcodes, images, links)
- [ ] Create content reconstruction functions
  - Rebuild HTML from translated text
  - Preserve formatting and structure
  - Handle edge cases

**Files to Create**:
- `includes/class-gaal-content-processor.php`

**Key Methods**:
```php
extract_translatable_content($post_id)
preserve_html_structure($html, $translated_text)
rebuild_post_content($translated_parts)
```

#### 2.2 Translation Workflow Engine
**Priority**: High  
**Estimated Time**: 8-10 hours

**Tasks**:
- [ ] Create `GAAL_Translation_Engine` class
- [ ] Implement `translate_post()` method
  - Get source post content
  - Call Google Translate API
  - Call LLM API for improvement (using OpenAI-compatible format)
  - Create/update translated post
  - Link translations in Polylang
- [ ] Implement `translate_all_languages()` method
  - Get available languages
  - Process each language sequentially or in batches
  - Track progress
  - Handle errors per language
- [ ] Implement `retranslate_post()` method
  - Get source post
  - Optionally get reference translation
  - Perform translation with context
  - Update existing post

**Files to Create**:
- `includes/class-gaal-translation-engine.php`

**Integration Points**:
- Use Polylang functions for language management
- Use WordPress post functions for content creation
- Integrate with translation job management

#### 2.3 Error Handling & Logging
**Priority**: Medium  
**Estimated Time**: 3-4 hours

**Tasks**:
- [ ] Implement comprehensive error handling
  - API errors (rate limits, authentication, network)
  - Content processing errors
  - WordPress errors
- [ ] Add logging system
  - Log translation attempts
  - Log errors with context
  - Log API usage for cost tracking
- [ ] Create error recovery mechanisms
  - Retry logic for transient failures
  - Fallback behaviors

**Files to Create**:
- `includes/class-gaal-translation-logger.php`

### Phase 3: Admin UI & REST API (Week 3)

#### 3.1 Meta Box UI
**Priority**: High  
**Estimated Time**: 6-8 hours

**Tasks**:
- [ ] Create meta box for translation controls
  - Display current language
  - Show translation status for all languages
  - Add action buttons
  - Show progress indicators
- [ ] Add JavaScript for AJAX interactions
  - Handle button clicks
  - Poll for progress updates
  - Display status messages
  - Handle errors
- [ ] Style meta box with CSS
  - Match WordPress admin styling
  - Responsive design
  - Clear visual hierarchy

**Files to Create/Modify**:
- `functions.php` - Meta box registration
- `admin/js/translation-admin.js` - JavaScript
- `admin/css/translation-admin.css` - Styles

**Meta Box Structure**:
```php
function gaal_add_translation_meta_box() {
    $post_types = array('strategy_course', 'article', 'tool');
    foreach ($post_types as $post_type) {
        add_meta_box(
            'gaal_translation_meta_box',
            __('Multilingual Translation', 'kingdom-training'),
            'gaal_translation_meta_box_callback',
            $post_type,
            'side',
            'default'
        );
    }
}
```

#### 3.2 REST API Endpoints
**Priority**: High  
**Estimated Time**: 6-8 hours

**Tasks**:
- [ ] Implement `POST /wp-json/gaal/v1/translate/generate-all`
  - Validate request (nonce, permissions)
  - Create translation job
  - Start background processing
  - Return job ID
- [ ] Implement `POST /wp-json/gaal/v1/translate/single`
  - Validate request
  - Translate to specific language
  - Return result
- [ ] Implement `POST /wp-json/gaal/v1/translate/retranslate`
  - Validate request
  - Re-translate existing post
  - Return result
- [ ] Implement `GET /wp-json/gaal/v1/translate/status/{post_id}`
  - Return current translation status
  - Return progress information
- [ ] Implement `POST /wp-json/gaal/v1/translate/resume`
  - Resume interrupted job
  - Return status

**Files to Modify**:
- `functions.php` - Add REST API route registrations

**Code Structure**:
```php
function gaal_register_translation_api() {
    register_rest_route('gaal/v1', '/translate/generate-all', array(
        'methods' => 'POST',
        'callback' => 'gaal_api_generate_all_translations',
        'permission_callback' => 'gaal_check_translation_permissions',
    ));
    // ... other endpoints
}
add_action('rest_api_init', 'gaal_register_translation_api');
```

#### 3.3 Background Processing
**Priority**: Medium  
**Estimated Time**: 4-6 hours

**Tasks**:
- [ ] Implement AJAX handler for translation processing
  - Process translation jobs
  - Update progress
  - Handle timeouts
- [ ] Add WordPress Cron integration (optional)
  - Schedule translation jobs
  - Process in background
- [ ] Implement polling mechanism for progress updates
  - Client-side polling via JavaScript
  - Return current status

**Files to Create/Modify**:
- `admin/js/translation-admin.js` - Polling logic
- `functions.php` - AJAX handlers

### Phase 4: Polylang Integration & Testing (Week 4)

#### 4.1 Polylang Integration
**Priority**: High  
**Estimated Time**: 4-6 hours

**Tasks**:
- [ ] Ensure proper language assignment
  - Use `pll_set_post_language()` when creating posts
  - Use `pll_save_post_translations()` to link translations
- [ ] Handle Polylang synchronization
  - Sync featured images
  - Sync taxonomies (if configured)
  - Respect Polylang settings
- [ ] Test with multiple languages
  - Verify translation links
  - Verify language assignment
  - Verify frontend display

**Files to Modify**:
- `includes/class-gaal-translation-engine.php`

#### 4.2 Testing & Quality Assurance
**Priority**: High  
**Estimated Time**: 8-10 hours

**Tasks**:
- [ ] Unit tests for API classes
  - Test Google Translate integration
  - Test LLM API integration (OpenAI-compatible)
  - Test with different providers (OpenAI, Anthropic, etc.)
  - Test error handling
- [ ] Integration tests
  - Test full translation workflow
  - Test Polylang integration
  - Test job resumption
- [ ] Manual testing
  - Test all user workflows
  - Test error scenarios
  - Test with various content types
  - Test performance with multiple languages
- [ ] Edge case testing
  - Very long content
  - Special characters
  - HTML complexity
  - API failures
  - Network interruptions

**Test Scenarios**:
1. Generate all translations from English post
2. Translate single language
3. Re-translate existing post
4. Resume interrupted process
5. Handle API errors gracefully
6. Test with different post types
7. Test with various content lengths

### Phase 5: Documentation & Polish (Week 5)

#### 5.1 User Documentation
**Priority**: Medium  
**Estimated Time**: 3-4 hours

**Tasks**:
- [ ] Create user guide
  - How to configure API keys
  - How to use translation features
  - Troubleshooting guide
- [ ] Add inline help text
  - Tooltips in admin UI
  - Help tabs in settings page
- [ ] Create video tutorials (optional)

**Files to Create**:
- `docs/translation-feature-user-guide.md`

#### 5.2 Developer Documentation
**Priority**: Medium  
**Estimated Time**: 2-3 hours

**Tasks**:
- [ ] Document API classes
  - Class structure
  - Method documentation
  - Usage examples
- [ ] Document REST API endpoints
  - Endpoint documentation
  - Request/response examples
  - Error codes
- [ ] Document hooks and filters
  - Available hooks
  - Customization examples

**Files to Create**:
- `docs/translation-feature-developer-guide.md`

#### 5.3 Performance Optimization
**Priority**: Medium  
**Estimated Time**: 4-6 hours

**Tasks**:
- [ ] Optimize API calls
  - Batch requests where possible
  - Implement caching
  - Rate limiting
- [ ] Optimize database queries
  - Minimize post meta queries
  - Use transients for status checks
- [ ] Optimize JavaScript
  - Debounce polling
  - Minimize DOM manipulation
  - Lazy load resources

#### 5.4 Security Hardening
**Priority**: High  
**Estimated Time**: 2-3 hours

**Tasks**:
- [ ] Security audit
  - Verify nonce usage
  - Verify capability checks
  - Verify input sanitization
  - Verify output escaping
- [ ] API key security
  - Secure storage
  - No exposure in frontend
  - Encryption at rest (if possible)

## File Structure

```
kingdom-training-theme/
├── functions.php (modified)
├── includes/
│   ├── class-gaal-translation-api.php
│   ├── class-gaal-google-translate-api.php
│   ├── class-gaal-llm-api.php (OpenAI-compatible, provider-agnostic)
│   ├── class-gaal-translation-job.php
│   ├── class-gaal-content-processor.php
│   ├── class-gaal-translation-engine.php
│   └── class-gaal-translation-logger.php
├── admin/
│   ├── js/
│   │   └── translation-admin.js
│   └── css/
│       └── translation-admin.css
└── docs/
    ├── translation-feature-user-guide.md
    └── translation-feature-developer-guide.md
```

## Dependencies & Setup

### Required WordPress Plugins
- Polylang (active)

### Required PHP Libraries
- Google Cloud Translation API PHP Client (or custom HTTP implementation)
- cURL extension or WordPress HTTP API (for LLM API calls)
- No specific LLM SDK required (uses standard HTTP with OpenAI-compatible format)

### API Accounts Required
- Google Cloud account with Translation API enabled
- LLM API account (OpenAI, Anthropic Claude, Google Gemini, or any OpenAI-compatible provider)

### Configuration Steps
1. Install and activate Polylang plugin
2. Configure languages in Polylang
3. Obtain Google Translate API key
4. Obtain LLM API credentials:
   - For OpenAI: API key from https://platform.openai.com
   - For Anthropic: API key from https://console.anthropic.com
   - For Google Gemini: API key from https://aistudio.google.com
   - For other providers: API key and endpoint URL
5. Configure API keys and endpoint URL in WordPress admin
6. Select LLM model name
7. Select enabled languages for translation

## Risk Mitigation

### API Rate Limits
- Implement rate limiting
- Queue requests if needed
- Provide user feedback on rate limit status

### API Costs
- Monitor API usage
- Provide cost estimates in admin
- Allow disabling expensive features

### Translation Quality
- Set expectations (AI-assisted, not perfect)
- Always allow manual editing
- Provide quality scores (future enhancement)

### Performance Impact
- Use asynchronous processing
- Don't block admin UI
- Implement timeouts and resumption

## Success Metrics

- Translation generation completes successfully for all languages
- Translation quality is improved by LLM AI (subjective, but measurable)
- Process can be resumed after interruption
- Admin UI is intuitive and provides clear feedback
- API errors are handled gracefully
- No performance degradation on site
- LLM provider can be switched easily (OpenAI, Claude, Gemini, etc.)

## Timeline Summary

- **Week 1**: Foundation & Configuration (14-20 hours)
- **Week 2**: Core Translation Engine (15-20 hours)
- **Week 3**: Admin UI & REST API (16-22 hours)
- **Week 4**: Polylang Integration & Testing (12-16 hours)
- **Week 5**: Documentation & Polish (11-16 hours)

**Total Estimated Time**: 68-94 hours

## Next Steps

1. Review and approve implementation plan
2. Set up development environment
3. Obtain API credentials
4. Begin Phase 1 implementation
5. Regular progress reviews and adjustments

