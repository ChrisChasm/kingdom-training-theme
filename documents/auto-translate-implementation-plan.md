# Auto Translate Dashboard - Implementation Plan

## Overview

A dedicated top-level WordPress admin page **"Auto Translate"** that provides a centralized interface for managing multilingual translations across all content types. This approach separates translation orchestration from individual post editing, enabling better timeout handling, batch operations, and progress visibility.

---

## Goals

1. **Gap Detection** - Scan all English content and identify missing translations for enabled languages
2. **Bulk Draft Creation** - Create draft posts for all missing translations (copy English content)
3. **Chunked Translation** - Translate content using Google Translate via sequential AJAX requests (avoids PHP timeouts)
4. **Progress Tracking** - Real-time visibility into translation queue progress
5. **Evaluation Step** - Optional LLM review pass for quality improvement

---

## Architecture

### Key Principle: Separation of Concerns

| Step | Operation | Method | Duration |
|------|-----------|--------|----------|
| 1. Scan | Find translation gaps | Synchronous PHP | ~1-2 seconds |
| 2. Draft | Create empty drafts with English content | AJAX (per batch) | ~100ms per post |
| 3. Translate | Google Translate in chunks | AJAX (per chunk) | ~3-5s per chunk |
| 4. Evaluate | LLM quality review | AJAX (per post) | ~5-10s per post |

Each step is independent - if translation fails, drafts exist. If evaluation fails, translation exists.

---

## File Structure

```
kingdom-training-theme/
├── includes/
│   ├── class-gaal-translation-dashboard.php    # Main dashboard class
│   ├── class-gaal-translation-scanner.php      # Gap detection logic
│   ├── class-gaal-batch-translator.php         # Batch operations
│   └── (existing translation classes...)
│
├── admin/
│   ├── views/
│   │   └── auto-translate-dashboard.php        # Dashboard HTML template
│   ├── js/
│   │   └── auto-translate-dashboard.js         # Queue manager + UI
│   └── css/
│       └── auto-translate-dashboard.css        # Dashboard styles
│
└── functions.php                                # Hook registrations
```

---

## Phase 1: Dashboard Foundation

### 1.1 Admin Menu Registration

Register top-level menu item with gear icon:

```php
// In functions.php or class-gaal-translation-dashboard.php

add_action('admin_menu', 'gaal_register_auto_translate_menu');

function gaal_register_auto_translate_menu() {
    add_menu_page(
        __('Auto Translate', 'kingdom-training'),           // Page title
        __('Auto Translate', 'kingdom-training'),           // Menu title
        'manage_options',                                    // Capability
        'gaal-auto-translate',                              // Menu slug
        'gaal_render_auto_translate_dashboard',             // Callback
        'dashicons-translation',                            // Icon
        30                                                   // Position (after Comments)
    );
    
    // Submenu pages
    add_submenu_page(
        'gaal-auto-translate',
        __('Dashboard', 'kingdom-training'),
        __('Dashboard', 'kingdom-training'),
        'manage_options',
        'gaal-auto-translate',
        'gaal_render_auto_translate_dashboard'
    );
    
    add_submenu_page(
        'gaal-auto-translate',
        __('Settings', 'kingdom-training'),
        __('Settings', 'kingdom-training'),
        'manage_options',
        'gaal-translation-settings',
        'gaal_translation_settings_page'  // Existing settings page
    );
}
```

### 1.2 Dashboard Template Structure

```php
// admin/views/auto-translate-dashboard.php

<div class="wrap gaal-auto-translate-dashboard">
    <h1><?php echo esc_html__('Auto Translate Dashboard', 'kingdom-training'); ?></h1>
    
    <!-- Tab Navigation -->
    <nav class="nav-tab-wrapper">
        <a href="#overview" class="nav-tab nav-tab-active">Overview</a>
        <a href="#gaps" class="nav-tab">Translation Gaps</a>
        <a href="#queue" class="nav-tab">Queue</a>
        <a href="#history" class="nav-tab">History</a>
    </nav>
    
    <!-- Tab Content -->
    <div class="tab-content">
        <!-- Overview Tab -->
        <div id="overview" class="tab-pane active">
            <!-- Summary cards -->
            <!-- Quick actions -->
        </div>
        
        <!-- Gaps Tab -->
        <div id="gaps" class="tab-pane">
            <!-- Filterable table of posts needing translation -->
        </div>
        
        <!-- Queue Tab -->
        <div id="queue" class="tab-pane">
            <!-- Active translation queue with progress -->
        </div>
        
        <!-- History Tab -->
        <div id="history" class="tab-pane">
            <!-- Completed translations -->
        </div>
    </div>
</div>
```

### 1.3 Enqueue Assets

```php
add_action('admin_enqueue_scripts', 'gaal_enqueue_auto_translate_assets');

function gaal_enqueue_auto_translate_assets($hook) {
    if ($hook !== 'toplevel_page_gaal-auto-translate') {
        return;
    }
    
    wp_enqueue_style(
        'gaal-auto-translate-dashboard',
        get_template_directory_uri() . '/admin/css/auto-translate-dashboard.css',
        [],
        filemtime(get_template_directory() . '/admin/css/auto-translate-dashboard.css')
    );
    
    wp_enqueue_script(
        'gaal-auto-translate-dashboard',
        get_template_directory_uri() . '/admin/js/auto-translate-dashboard.js',
        ['jquery'],
        filemtime(get_template_directory() . '/admin/js/auto-translate-dashboard.js'),
        true
    );
    
    wp_localize_script('gaal-auto-translate-dashboard', 'gaalAutoTranslate', [
        'apiUrl' => rest_url('gaal/v1/'),
        'nonce' => wp_create_nonce('wp_rest'),
        'strings' => [
            'scanning' => __('Scanning for gaps...', 'kingdom-training'),
            'creating_drafts' => __('Creating drafts...', 'kingdom-training'),
            'translating' => __('Translating...', 'kingdom-training'),
            'complete' => __('Complete', 'kingdom-training'),
            'failed' => __('Failed', 'kingdom-training'),
            'confirm_translate_all' => __('This will translate all selected posts. Continue?', 'kingdom-training'),
        ],
        'languages' => gaal_get_enabled_languages_data(),
        'postTypes' => ['post', 'page', 'article', 'strategy_course', 'tool'],
    ]);
}
```

---

## Phase 2: Gap Detection

### 2.1 Scanner Class

```php
// includes/class-gaal-translation-scanner.php

class GAAL_Translation_Scanner {
    
    /**
     * Supported post types for translation
     */
    protected $post_types = ['post', 'page', 'article', 'strategy_course', 'tool'];
    
    /**
     * Find all English posts missing translations
     * 
     * @param array $filters Optional filters (post_type, language, etc.)
     * @return array Translation gaps
     */
    public function find_gaps($filters = []) {
        $enabled_languages = get_option('gaal_translation_enabled_languages', []);
        $target_languages = array_diff($enabled_languages, ['en']);
        
        if (empty($target_languages)) {
            return [];
        }
        
        // Build query args
        $args = [
            'post_type' => $filters['post_type'] ?? $this->post_types,
            'post_status' => 'publish',
            'posts_per_page' => -1,
            'fields' => 'ids',
            'lang' => 'en',
        ];
        
        $english_post_ids = get_posts($args);
        $gaps = [];
        
        foreach ($english_post_ids as $post_id) {
            $translations = function_exists('pll_get_post_translations') 
                ? pll_get_post_translations($post_id) 
                : [];
            
            $existing_langs = array_keys($translations);
            $missing_langs = array_diff($target_languages, $existing_langs);
            
            // Apply language filter if specified
            if (!empty($filters['language'])) {
                $missing_langs = array_intersect($missing_langs, (array) $filters['language']);
            }
            
            if (!empty($missing_langs)) {
                $post = get_post($post_id);
                $gaps[$post_id] = [
                    'id' => $post_id,
                    'title' => $post->post_title,
                    'post_type' => $post->post_type,
                    'post_type_label' => get_post_type_object($post->post_type)->labels->singular_name,
                    'status' => $post->post_status,
                    'edit_link' => get_edit_post_link($post_id, 'raw'),
                    'missing_languages' => array_values($missing_langs),
                    'existing_translations' => $this->get_translation_status($translations),
                    'content_length' => strlen($post->post_content),
                    'estimated_chunks' => ceil(strlen($post->post_content) / 5000),
                ];
            }
        }
        
        return $gaps;
    }
    
    /**
     * Get summary statistics
     */
    public function get_summary() {
        $gaps = $this->find_gaps();
        $enabled_languages = get_option('gaal_translation_enabled_languages', []);
        $target_languages = array_diff($enabled_languages, ['en']);
        
        $total_posts = count($gaps);
        $total_translations_needed = 0;
        $by_language = [];
        $by_post_type = [];
        
        foreach ($target_languages as $lang) {
            $by_language[$lang] = 0;
        }
        
        foreach ($gaps as $gap) {
            $total_translations_needed += count($gap['missing_languages']);
            
            foreach ($gap['missing_languages'] as $lang) {
                $by_language[$lang]++;
            }
            
            $pt = $gap['post_type'];
            $by_post_type[$pt] = ($by_post_type[$pt] ?? 0) + 1;
        }
        
        return [
            'posts_needing_translation' => $total_posts,
            'total_translations_needed' => $total_translations_needed,
            'languages_enabled' => count($target_languages),
            'by_language' => $by_language,
            'by_post_type' => $by_post_type,
        ];
    }
    
    /**
     * Format translation status for display
     */
    protected function get_translation_status($translations) {
        $status = [];
        foreach ($translations as $lang => $post_id) {
            if ($lang === 'en') continue;
            $post = get_post($post_id);
            if ($post) {
                $status[$lang] = [
                    'id' => $post_id,
                    'status' => $post->post_status,
                    'edit_link' => get_edit_post_link($post_id, 'raw'),
                ];
            }
        }
        return $status;
    }
}
```

### 2.2 REST Endpoint for Gap Scanning

```php
// Register in functions.php

register_rest_route('gaal/v1', '/translate/scan', [
    'methods' => 'GET',
    'callback' => 'gaal_api_scan_translation_gaps',
    'permission_callback' => function() {
        return current_user_can('manage_options');
    },
    'args' => [
        'post_type' => [
            'type' => 'string',
            'default' => '',
        ],
        'language' => [
            'type' => 'string', 
            'default' => '',
        ],
    ],
]);

function gaal_api_scan_translation_gaps($request) {
    $scanner = new GAAL_Translation_Scanner();
    
    $filters = [];
    if ($request->get_param('post_type')) {
        $filters['post_type'] = $request->get_param('post_type');
    }
    if ($request->get_param('language')) {
        $filters['language'] = $request->get_param('language');
    }
    
    return rest_ensure_response([
        'success' => true,
        'gaps' => $scanner->find_gaps($filters),
        'summary' => $scanner->get_summary(),
    ]);
}
```

---

## Phase 3: Bulk Draft Creation

### 3.1 Draft Creator

```php
// In class-gaal-batch-translator.php or class-gaal-translation-dashboard.php

/**
 * Create draft translations for multiple posts
 * 
 * @param array $items Array of ['post_id' => X, 'languages' => ['ar', 'es']]
 * @return array Results
 */
function gaal_create_translation_drafts($items) {
    $results = [];
    
    foreach ($items as $item) {
        $post_id = $item['post_id'];
        $languages = $item['languages'];
        $source_post = get_post($post_id);
        
        if (!$source_post) {
            $results[$post_id] = ['error' => 'Post not found'];
            continue;
        }
        
        $results[$post_id] = [];
        
        foreach ($languages as $lang) {
            // Check if translation already exists
            $translations = pll_get_post_translations($post_id);
            
            if (isset($translations[$lang])) {
                $results[$post_id][$lang] = [
                    'status' => 'exists',
                    'draft_id' => $translations[$lang],
                ];
                continue;
            }
            
            // Create draft with English content (not yet translated)
            $draft_data = [
                'post_title'   => $source_post->post_title,
                'post_content' => $source_post->post_content,
                'post_excerpt' => $source_post->post_excerpt,
                'post_status'  => 'draft',
                'post_type'    => $source_post->post_type,
                'post_author'  => $source_post->post_author,
            ];
            
            $draft_id = wp_insert_post($draft_data);
            
            if (is_wp_error($draft_id)) {
                $results[$post_id][$lang] = [
                    'status' => 'error',
                    'error' => $draft_id->get_error_message(),
                ];
                continue;
            }
            
            // Set language
            pll_set_post_language($draft_id, $lang);
            
            // Link translations
            $translations[$lang] = $draft_id;
            $translations['en'] = $post_id;
            pll_save_post_translations($translations);
            
            // Copy featured image
            $thumbnail_id = get_post_thumbnail_id($post_id);
            if ($thumbnail_id) {
                set_post_thumbnail($draft_id, $thumbnail_id);
            }
            
            // Copy relevant meta (categories, tags, etc.)
            gaal_copy_post_meta($post_id, $draft_id);
            
            // Mark for translation tracking
            update_post_meta($draft_id, '_gaal_needs_translation', true);
            update_post_meta($draft_id, '_gaal_source_post_id', $post_id);
            update_post_meta($draft_id, '_gaal_created_at', current_time('mysql'));
            
            $results[$post_id][$lang] = [
                'status' => 'created',
                'draft_id' => $draft_id,
            ];
        }
    }
    
    return $results;
}

/**
 * Copy relevant post meta from source to target
 */
function gaal_copy_post_meta($source_id, $target_id) {
    // Copy taxonomy terms (Polylang handles term translations)
    $taxonomies = get_object_taxonomies(get_post_type($source_id));
    
    foreach ($taxonomies as $taxonomy) {
        // Skip language taxonomy
        if ($taxonomy === 'language' || $taxonomy === 'post_translations') {
            continue;
        }
        
        $terms = wp_get_object_terms($source_id, $taxonomy, ['fields' => 'ids']);
        if (!is_wp_error($terms) && !empty($terms)) {
            wp_set_object_terms($target_id, $terms, $taxonomy);
        }
    }
    
    // Copy specific meta fields (customize as needed)
    $meta_keys_to_copy = [
        '_yoast_wpseo_metadesc',
        '_yoast_wpseo_title',
        // Add other meta keys as needed
    ];
    
    foreach ($meta_keys_to_copy as $key) {
        $value = get_post_meta($source_id, $key, true);
        if ($value) {
            update_post_meta($target_id, $key, $value);
        }
    }
}
```

### 3.2 REST Endpoint for Draft Creation

```php
register_rest_route('gaal/v1', '/translate/create-drafts', [
    'methods' => 'POST',
    'callback' => 'gaal_api_create_translation_drafts',
    'permission_callback' => function() {
        return current_user_can('manage_options');
    },
]);

function gaal_api_create_translation_drafts($request) {
    $items = $request->get_param('items'); // [['post_id' => 123, 'languages' => ['ar', 'es']]]
    
    if (empty($items)) {
        return new WP_Error('no_items', 'No items provided', ['status' => 400]);
    }
    
    $results = gaal_create_translation_drafts($items);
    
    // Count results
    $created = 0;
    $existed = 0;
    $errors = 0;
    
    foreach ($results as $post_results) {
        foreach ($post_results as $lang_result) {
            if (isset($lang_result['status'])) {
                switch ($lang_result['status']) {
                    case 'created': $created++; break;
                    case 'exists': $existed++; break;
                    case 'error': $errors++; break;
                }
            }
        }
    }
    
    return rest_ensure_response([
        'success' => true,
        'results' => $results,
        'summary' => [
            'created' => $created,
            'existed' => $existed,
            'errors' => $errors,
        ],
    ]);
}
```

---

## Phase 4: Translation Queue Manager

### 4.1 JavaScript Queue Implementation

```javascript
// admin/js/auto-translate-dashboard.js

(function($) {
    'use strict';
    
    /**
     * Translation Queue Manager
     * Orchestrates translation of multiple posts/languages via AJAX
     */
    class TranslationQueueManager {
        constructor() {
            this.queue = [];
            this.currentItem = null;
            this.currentStep = null;
            this.completed = [];
            this.failed = [];
            this.isPaused = false;
            this.isCancelled = false;
            
            this.callbacks = {
                onProgress: null,
                onItemStart: null,
                onItemComplete: null,
                onItemError: null,
                onQueueComplete: null,
            };
        }
        
        /**
         * Add items to queue
         * @param {Array} items - [{source_post_id, target_post_id, language, title}]
         */
        addItems(items) {
            this.queue.push(...items);
            this.updateProgress();
        }
        
        /**
         * Start processing queue
         */
        async start() {
            this.isCancelled = false;
            this.isPaused = false;
            
            while (this.queue.length > 0 && !this.isCancelled) {
                if (this.isPaused) {
                    await this.waitForResume();
                }
                
                this.currentItem = this.queue.shift();
                this.updateProgress();
                
                if (this.callbacks.onItemStart) {
                    this.callbacks.onItemStart(this.currentItem);
                }
                
                try {
                    await this.translateItem(this.currentItem);
                    this.completed.push(this.currentItem);
                    
                    if (this.callbacks.onItemComplete) {
                        this.callbacks.onItemComplete(this.currentItem);
                    }
                } catch (error) {
                    this.currentItem.error = error.message;
                    this.failed.push(this.currentItem);
                    
                    if (this.callbacks.onItemError) {
                        this.callbacks.onItemError(this.currentItem, error);
                    }
                }
                
                this.currentItem = null;
                this.updateProgress();
            }
            
            if (this.callbacks.onQueueComplete) {
                this.callbacks.onQueueComplete({
                    completed: this.completed,
                    failed: this.failed,
                    cancelled: this.isCancelled,
                });
            }
        }
        
        /**
         * Translate a single item using chunked translation
         */
        async translateItem(item) {
            return new Promise((resolve, reject) => {
                // Use existing chunked translation infrastructure
                this.translateChunked(item.source_post_id, item.language, item.target_post_id, {
                    onProgress: (progress) => {
                        this.currentStep = progress;
                        this.updateProgress();
                    },
                    onComplete: () => resolve(),
                    onError: (error) => reject(error),
                });
            });
        }
        
        /**
         * Chunked translation - sequential AJAX calls for each step
         */
        translateChunked(sourcePostId, targetLanguage, targetPostId, options) {
            let jobId = null;
            let steps = ['init'];
            let stepIndex = 0;
            
            const processStep = () => {
                if (stepIndex >= steps.length) {
                    options.onComplete();
                    return;
                }
                
                const step = steps[stepIndex];
                
                options.onProgress({
                    step: step,
                    stepIndex: stepIndex,
                    totalSteps: steps.length,
                    message: this.getStepMessage(step),
                });
                
                $.ajax({
                    url: gaalAutoTranslate.apiUrl + 'translate/chunked',
                    method: 'POST',
                    beforeSend: (xhr) => {
                        xhr.setRequestHeader('X-WP-Nonce', gaalAutoTranslate.nonce);
                    },
                    data: {
                        source_post_id: sourcePostId,
                        target_language: targetLanguage,
                        target_post_id: targetPostId,
                        step: step,
                        job_id: jobId || 0,
                    },
                    success: (response) => {
                        if (!response.success) {
                            options.onError(new Error(response.message || 'Translation failed'));
                            return;
                        }
                        
                        // Handle init response - get job ID and build steps array
                        if (step === 'init') {
                            jobId = response.job_id;
                            steps = ['init', 'title'];
                            for (let i = 0; i < response.chunk_count; i++) {
                                steps.push('content_' + i);
                            }
                            steps.push('excerpt', 'finalize');
                        }
                        
                        stepIndex++;
                        processStep();
                    },
                    error: (xhr) => {
                        const msg = xhr.responseJSON?.message || 'Request failed';
                        options.onError(new Error(msg));
                    },
                });
            };
            
            processStep();
        }
        
        getStepMessage(step) {
            const messages = {
                'init': 'Initializing...',
                'title': 'Translating title...',
                'excerpt': 'Translating excerpt...',
                'finalize': 'Saving translation...',
            };
            
            if (step.startsWith('content_')) {
                const chunk = parseInt(step.split('_')[1]) + 1;
                return `Translating content (part ${chunk})...`;
            }
            
            return messages[step] || step;
        }
        
        pause() {
            this.isPaused = true;
        }
        
        resume() {
            this.isPaused = false;
        }
        
        cancel() {
            this.isCancelled = true;
            this.isPaused = false;
        }
        
        waitForResume() {
            return new Promise((resolve) => {
                const check = () => {
                    if (!this.isPaused || this.isCancelled) {
                        resolve();
                    } else {
                        setTimeout(check, 100);
                    }
                };
                check();
            });
        }
        
        updateProgress() {
            if (this.callbacks.onProgress) {
                this.callbacks.onProgress({
                    total: this.queue.length + this.completed.length + this.failed.length + (this.currentItem ? 1 : 0),
                    pending: this.queue.length,
                    completed: this.completed.length,
                    failed: this.failed.length,
                    current: this.currentItem,
                    currentStep: this.currentStep,
                    isPaused: this.isPaused,
                });
            }
        }
        
        getStats() {
            return {
                total: this.queue.length + this.completed.length + this.failed.length,
                pending: this.queue.length,
                completed: this.completed.length,
                failed: this.failed.length,
            };
        }
    }
    
    // Export to global scope
    window.GAALTranslationQueue = TranslationQueueManager;
    
})(jQuery);
```

### 4.2 Modify Existing Chunked Translation Endpoint

Update `gaal_chunked_translate_finalize()` in `functions.php` to support translating into an existing draft:

```php
function gaal_chunked_translate_finalize($job_id, $source_post, $target_language, $engine) {
    // ... existing code ...
    
    // NEW: Check if we should update an existing post instead of creating
    $target_post_id = $job->get_meta('target_post_id');
    
    if ($target_post_id) {
        // Update existing draft
        $update_data = [
            'ID' => $target_post_id,
            'post_title' => $translated_title,
            'post_content' => $translated_content,
            'post_excerpt' => $translated_excerpt,
        ];
        
        $result = wp_update_post($update_data);
        
        if (is_wp_error($result)) {
            return new WP_Error('update_failed', $result->get_error_message());
        }
        
        $translated_post_id = $target_post_id;
        
        // Clear the "needs translation" flag
        delete_post_meta($translated_post_id, '_gaal_needs_translation');
        update_post_meta($translated_post_id, '_gaal_translated_at', current_time('mysql'));
        
    } else {
        // Existing create logic
        // ...
    }
    
    // ... rest of existing code ...
}
```

Also update `gaal_chunked_translate_init()` to store target_post_id:

```php
function gaal_chunked_translate_init($source_post, $target_language, $engine, $request) {
    // ... existing code ...
    
    // NEW: Store target post ID if provided
    $target_post_id = $request->get_param('target_post_id');
    if ($target_post_id) {
        $job->set_meta('target_post_id', intval($target_post_id));
    }
    
    // ... rest of existing code ...
}
```

---

## Phase 5: Dashboard UI Implementation

### 5.1 Overview Tab

```html
<!-- Summary Cards -->
<div class="gaal-summary-cards">
    <div class="gaal-card">
        <div class="gaal-card-number" id="stat-posts-needing">--</div>
        <div class="gaal-card-label">Posts Need Translation</div>
    </div>
    <div class="gaal-card">
        <div class="gaal-card-number" id="stat-translations-needed">--</div>
        <div class="gaal-card-label">Total Translations Needed</div>
    </div>
    <div class="gaal-card">
        <div class="gaal-card-number" id="stat-languages">--</div>
        <div class="gaal-card-label">Languages Enabled</div>
    </div>
</div>

<!-- Quick Actions -->
<div class="gaal-quick-actions">
    <button type="button" class="button button-primary" id="btn-scan">
        <span class="dashicons dashicons-search"></span>
        Scan for Gaps
    </button>
    <button type="button" class="button" id="btn-create-all-drafts" disabled>
        <span class="dashicons dashicons-welcome-add-page"></span>
        Create All Drafts
    </button>
    <button type="button" class="button button-primary" id="btn-translate-all" disabled>
        <span class="dashicons dashicons-translation"></span>
        Translate All
    </button>
</div>

<!-- Progress Section (hidden until active) -->
<div class="gaal-progress-section" id="progress-section" style="display: none;">
    <h3>Translation Progress</h3>
    <div class="gaal-progress-bar-container">
        <div class="gaal-progress-bar" id="overall-progress" style="width: 0%"></div>
    </div>
    <div class="gaal-progress-stats">
        <span id="progress-completed">0</span> / <span id="progress-total">0</span> completed
        <span class="gaal-progress-failed" id="progress-failed-container" style="display: none;">
            (<span id="progress-failed">0</span> failed)
        </span>
    </div>
    <div class="gaal-current-item" id="current-item">
        <!-- Current translation details -->
    </div>
    <div class="gaal-progress-controls">
        <button type="button" class="button" id="btn-pause">Pause</button>
        <button type="button" class="button" id="btn-cancel">Cancel</button>
    </div>
</div>
```

### 5.2 Gaps Tab

```html
<!-- Filters -->
<div class="gaal-filters">
    <select id="filter-post-type">
        <option value="">All Post Types</option>
        <option value="article">Articles</option>
        <option value="strategy_course">Strategy Courses</option>
        <option value="tool">Tools</option>
        <option value="post">Posts</option>
        <option value="page">Pages</option>
    </select>
    
    <select id="filter-language">
        <option value="">All Languages</option>
        <!-- Populated dynamically -->
    </select>
    
    <button type="button" class="button" id="btn-refresh-gaps">
        <span class="dashicons dashicons-update"></span>
        Refresh
    </button>
</div>

<!-- Bulk Actions -->
<div class="gaal-bulk-actions">
    <label>
        <input type="checkbox" id="select-all-gaps"> Select All
    </label>
    <button type="button" class="button" id="btn-create-selected-drafts" disabled>
        Create Drafts for Selected
    </button>
    <button type="button" class="button button-primary" id="btn-translate-selected" disabled>
        Translate Selected
    </button>
</div>

<!-- Gaps Table -->
<table class="wp-list-table widefat fixed striped" id="gaps-table">
    <thead>
        <tr>
            <th class="check-column"><input type="checkbox" id="select-all-header"></th>
            <th>Title</th>
            <th>Type</th>
            <th>Missing Languages</th>
            <th>Existing</th>
            <th>Est. Chunks</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody id="gaps-tbody">
        <!-- Populated via JavaScript -->
    </tbody>
</table>
```

### 5.3 CSS Styling

```css
/* admin/css/auto-translate-dashboard.css */

.gaal-auto-translate-dashboard {
    max-width: 1400px;
}

/* Summary Cards */
.gaal-summary-cards {
    display: flex;
    gap: 20px;
    margin: 20px 0;
}

.gaal-card {
    background: #fff;
    border: 1px solid #c3c4c7;
    border-radius: 4px;
    padding: 20px 30px;
    text-align: center;
    min-width: 180px;
}

.gaal-card-number {
    font-size: 48px;
    font-weight: 600;
    color: #2271b1;
    line-height: 1;
}

.gaal-card-label {
    font-size: 14px;
    color: #646970;
    margin-top: 8px;
}

/* Quick Actions */
.gaal-quick-actions {
    display: flex;
    gap: 10px;
    margin: 20px 0;
}

.gaal-quick-actions .button {
    display: flex;
    align-items: center;
    gap: 5px;
}

/* Progress Section */
.gaal-progress-section {
    background: #fff;
    border: 1px solid #c3c4c7;
    border-radius: 4px;
    padding: 20px;
    margin: 20px 0;
}

.gaal-progress-bar-container {
    background: #dcdcde;
    border-radius: 4px;
    height: 24px;
    overflow: hidden;
    margin: 15px 0;
}

.gaal-progress-bar {
    background: linear-gradient(90deg, #2271b1, #135e96);
    height: 100%;
    transition: width 0.3s ease;
}

.gaal-progress-bar.complete {
    background: linear-gradient(90deg, #00a32a, #007017);
}

.gaal-progress-stats {
    font-size: 14px;
    color: #646970;
}

.gaal-progress-failed {
    color: #d63638;
}

.gaal-current-item {
    margin: 15px 0;
    padding: 10px 15px;
    background: #f6f7f7;
    border-radius: 4px;
    font-size: 13px;
}

/* Gaps Table */
.gaal-filters {
    display: flex;
    gap: 10px;
    margin: 15px 0;
    align-items: center;
}

.gaal-bulk-actions {
    display: flex;
    gap: 10px;
    margin: 15px 0;
    align-items: center;
}

#gaps-table .missing-languages {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

#gaps-table .lang-badge {
    display: inline-block;
    padding: 2px 8px;
    background: #f0f0f1;
    border-radius: 3px;
    font-size: 11px;
    font-weight: 500;
}

#gaps-table .lang-badge.missing {
    background: #fcf0f1;
    color: #8a2424;
}

#gaps-table .lang-badge.exists {
    background: #edfaef;
    color: #1e4620;
}

/* Tab Navigation */
.tab-content .tab-pane {
    display: none;
}

.tab-content .tab-pane.active {
    display: block;
}
```

---

## Phase 6: Evaluation Step (Optional)

### 6.1 LLM Evaluation Queue

After Google Translate completes, optionally queue posts for LLM review:

```php
class GAAL_Translation_Evaluator {
    
    /**
     * Evaluate translation quality with LLM
     */
    public function evaluate($post_id) {
        $source_id = get_post_meta($post_id, '_gaal_source_post_id', true);
        $source_post = get_post($source_id);
        $target_post = get_post($post_id);
        $target_language = pll_get_post_language($post_id);
        
        $llm = new GAAL_LLM_API(
            get_option('gaal_translation_llm_endpoint'),
            get_option('gaal_translation_llm_api_key'),
            get_option('gaal_translation_llm_model'),
            get_option('gaal_translation_llm_provider')
        );
        
        // Ask LLM to evaluate and optionally improve
        $prompt = $this->build_evaluation_prompt(
            $source_post->post_content,
            $target_post->post_content,
            $target_language
        );
        
        $response = $llm->complete($prompt);
        
        if (is_wp_error($response)) {
            return $response;
        }
        
        // Parse response and store evaluation
        $evaluation = [
            'score' => $this->extract_score($response),
            'issues' => $this->extract_issues($response),
            'suggestions' => $this->extract_suggestions($response),
            'evaluated_at' => current_time('mysql'),
        ];
        
        update_post_meta($post_id, '_gaal_evaluation', $evaluation);
        
        return $evaluation;
    }
    
    /**
     * Improve translation with LLM
     */
    public function improve($post_id) {
        // Similar to evaluate but asks LLM to rewrite
        // Returns improved content
    }
}
```

### 6.2 Evaluation UI

Add an "Evaluate" button next to completed translations, showing:
- Quality score (1-10)
- Identified issues
- Option to apply LLM improvements

---

## REST API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/gaal/v1/translate/scan` | GET | Find translation gaps |
| `/gaal/v1/translate/create-drafts` | POST | Bulk create draft posts |
| `/gaal/v1/translate/chunked` | POST | Chunked translation (existing) |
| `/gaal/v1/translate/evaluate` | POST | LLM evaluation (Phase 6) |
| `/gaal/v1/translate/queue-status` | GET | Get saved queue state |

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Create `class-gaal-translation-dashboard.php`
- [ ] Register admin menu page
- [ ] Create dashboard template with tab structure
- [ ] Enqueue CSS and JS assets
- [ ] Basic UI styling

### Phase 2: Gap Detection
- [ ] Create `class-gaal-translation-scanner.php`
- [ ] Implement `find_gaps()` method
- [ ] Implement `get_summary()` method
- [ ] Register `/translate/scan` REST endpoint
- [ ] Wire up "Scan" button in UI
- [ ] Populate gaps table with results

### Phase 3: Draft Creation
- [ ] Implement `gaal_create_translation_drafts()` function
- [ ] Register `/translate/create-drafts` REST endpoint
- [ ] Add "Create Drafts" button functionality
- [ ] Update gaps table to show created drafts

### Phase 4: Translation Queue
- [ ] Create `TranslationQueueManager` JavaScript class
- [ ] Modify chunked translation to support `target_post_id`
- [ ] Implement queue progress UI
- [ ] Add pause/resume/cancel controls
- [ ] Handle errors gracefully with retry option

### Phase 5: Polish
- [ ] Add post type and language filters
- [ ] Implement select all / bulk selection
- [ ] Add estimated time remaining
- [ ] Save queue state to localStorage for resume after page refresh
- [ ] Add success/failure notifications

### Phase 6: Evaluation (Optional)
- [ ] Create `class-gaal-translation-evaluator.php`
- [ ] Implement LLM evaluation prompts
- [ ] Add evaluation UI to dashboard
- [ ] Create evaluation queue separate from translation queue

---

## Timeout Mitigation Strategy

| Problem | Solution |
|---------|----------|
| PHP execution timeout | Each AJAX request handles one small piece (~5 seconds) |
| Memory limits | Content chunked into ~5KB pieces |
| API rate limits | Queue processes one item at a time with natural delays |
| Browser disconnect | Queue state saved to localStorage; can resume |
| Network errors | Automatic retry with exponential backoff |

---

## Future Enhancements

1. **Scheduled translations** - WP-Cron job to translate overnight
2. **Priority queue** - Mark important posts for translation first
3. **Translation memory** - Cache common phrases to reduce API costs
4. **Glossary support** - Maintain terminology consistency
5. **Diff view** - Show what changed between source and translation
6. **Webhook notifications** - Slack/email when batch completes
