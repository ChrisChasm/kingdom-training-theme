<?php
/**
 * Kingdom.Training Theme Functions
 * 
 * This theme is designed to work as a headless WordPress installation,
 * serving content via the REST API to a React/Vite frontend for Media to Disciple Making Movements training.
 */

// ============================================================================
// TRANSLATION AUTOMATION FEATURES
// ============================================================================

// Include translation automation classes
// Note: Logger must be loaded first as other classes depend on it
require_once get_template_directory() . '/includes/class-gaal-translation-logger.php';
require_once get_template_directory() . '/includes/admin-translation-settings.php';
require_once get_template_directory() . '/includes/class-gaal-translation-api.php';
require_once get_template_directory() . '/includes/class-gaal-google-translate-api.php';
require_once get_template_directory() . '/includes/class-gaal-llm-api.php';
require_once get_template_directory() . '/includes/class-gaal-translation-job.php';
require_once get_template_directory() . '/includes/class-gaal-content-processor.php';
require_once get_template_directory() . '/includes/class-gaal-translation-engine.php';
require_once get_template_directory() . '/includes/class-gaal-translation-scanner.php';
require_once get_template_directory() . '/includes/class-gaal-batch-translator.php';
require_once get_template_directory() . '/includes/class-gaal-translation-dashboard.php';

// ============================================================================
// PERFORMANCE OPTIMIZATIONS
// ============================================================================

/**
 * Add caching headers for REST API responses
 * This significantly reduces server load for repeated requests
 */
function gaal_add_rest_cache_headers($response, $server, $request) {
    // Only cache GET requests
    if ($request->get_method() !== 'GET') {
        return $response;
    }
    
    // Get the route
    $route = $request->get_route();
    
    // Skip caching for auth endpoints
    if (strpos($route, '/auth/') !== false) {
        return $response;
    }
    
    // Set cache headers for public content (5 minutes for content, 1 hour for translations)
    $cache_time = 300; // 5 minutes default
    
    if (strpos($route, '/translations') !== false) {
        $cache_time = 3600; // 1 hour for translations
    } elseif (strpos($route, '/site-info') !== false) {
        $cache_time = 3600; // 1 hour for site info
    }
    
    $response->header('Cache-Control', 'public, max-age=' . $cache_time);
    $response->header('Vary', 'Accept-Encoding');
    
    return $response;
}
add_filter('rest_post_dispatch', 'gaal_add_rest_cache_headers', 10, 3);

/**
 * Disable unnecessary WordPress features for headless setup
 * This reduces PHP execution time on every request
 */
function gaal_disable_unnecessary_features() {
    // Remove oEmbed discovery links
    remove_action('wp_head', 'wp_oembed_add_discovery_links');
    remove_action('wp_head', 'wp_oembed_add_host_js');
    
    // Remove REST API link in header (not needed, API still works)
    remove_action('wp_head', 'rest_output_link_wp_head');
    
    // Remove shortlink
    remove_action('wp_head', 'wp_shortlink_wp_head');
    
    // Remove WordPress version
    remove_action('wp_head', 'wp_generator');
    
    // Remove wlwmanifest link
    remove_action('wp_head', 'wlwmanifest_link');
    
    // Remove RSD link
    remove_action('wp_head', 'rsd_link');
    
    // Remove feed links
    remove_action('wp_head', 'feed_links', 2);
    remove_action('wp_head', 'feed_links_extra', 3);
    
    // Disable XML-RPC (security + performance)
    add_filter('xmlrpc_enabled', '__return_false');
    
    // Remove XML-RPC header
    remove_action('wp_head', 'rsd_link');
}
add_action('init', 'gaal_disable_unnecessary_features');

/**
 * Disable self-pingbacks (minor performance improvement)
 */
function gaal_disable_self_pingback(&$links) {
    $home = get_option('home');
    foreach ($links as $key => $link) {
        if (strpos($link, $home) !== false) {
            unset($links[$key]);
        }
    }
}
add_action('pre_ping', 'gaal_disable_self_pingback');

/**
 * Limit post revisions to reduce database bloat
 */
if (!defined('WP_POST_REVISIONS')) {
    define('WP_POST_REVISIONS', 5);
}

/**
 * Optimize heartbeat API (reduces admin AJAX calls)
 */
function gaal_optimize_heartbeat($settings) {
    $settings['interval'] = 60; // 60 seconds instead of 15
    return $settings;
}
add_filter('heartbeat_settings', 'gaal_optimize_heartbeat');

/**
 * Disable heartbeat on frontend (not needed for headless)
 */
function gaal_disable_frontend_heartbeat() {
    if (!is_admin()) {
        wp_deregister_script('heartbeat');
    }
}
add_action('init', 'gaal_disable_frontend_heartbeat', 1);

// Enable REST API CORS
function gaal_enable_cors() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        // Get the origin from the request
        $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
        
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce, X-Requested-With');
        header('Access-Control-Expose-Headers: X-WP-Nonce');
        
        // Handle preflight requests
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            status_header(200);
            exit;
        }
        
        return $value;
    });
    
    // Ensure cookies are sent with REST API requests
    add_filter('rest_authentication_errors', function($result, $server = null, $request = null) {
        // Allow our custom auth endpoint to work without requiring authentication
        if (isset($_SERVER['REQUEST_URI']) && strpos($_SERVER['REQUEST_URI'], '/gaal/v1/auth/me') !== false) {
            return true; // Allow the request
        }
        
        // Allow Gospel Ambition Web Forms endpoints to work without authentication
        if ($request && method_exists($request, 'get_route')) {
            $route = $request->get_route();
            if (strpos($route, '/go-webform/') === 0) {
                return true; // Allow access
            }
        }
        // Fallback: check REQUEST_URI if route is not available
        if (isset($_SERVER['REQUEST_URI']) && strpos($_SERVER['REQUEST_URI'], '/go-webform/') !== false) {
            return true; // Allow the request
        }
        
        return $result;
    }, 20, 3);
}
add_action('rest_api_init', 'gaal_enable_cors');

// Theme Setup
function gaal_theme_setup() {
    // Add theme support for various features
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('custom-logo');
    add_theme_support('html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
    ));

    // Register navigation menus
    register_nav_menus(array(
        'primary' => __('Primary Menu', 'kingdom-training'),
        'footer' => __('Footer Menu', 'kingdom-training'),
    ));

    // Add excerpt support to pages
    add_post_type_support('page', 'excerpt');
}
add_action('after_setup_theme', 'gaal_theme_setup');

// Set permalink structure to "Post name" (/%postname%/)
// This ensures REST API endpoints work correctly
function gaal_set_permalink_structure() {
    // Check if permalink structure is already set to post name
    $current_structure = get_option('permalink_structure');
    
    // Post name structure is '/%postname%/'
    if ($current_structure !== '/%postname%/') {
        // Set permalink structure to post name
        update_option('permalink_structure', '/%postname%/');
        
        // Flush rewrite rules to ensure changes take effect
        flush_rewrite_rules(false);
    }
}
// Run on theme activation (runs once when theme is activated)
add_action('after_switch_theme', 'gaal_set_permalink_structure');
// Run once on admin init to fix existing installations (only if not already set)
// Use a transient to avoid running on every admin page load
add_action('admin_init', function() {
    $transient_key = 'gaal_permalink_structure_set';
    if (!get_transient($transient_key)) {
        gaal_set_permalink_structure();
        // Set transient for 1 hour to avoid repeated checks
        set_transient($transient_key, true, HOUR_IN_SECONDS);
    }
});

// Register Custom Post Types
// Register Custom Post Types and Taxonomies
function gaal_register_custom_post_types() {
    
    // Register Custom Taxonomies
    
    // Strategy Course Category
    register_taxonomy('strategy_course_category', 'strategy_course', array(
        'labels' => array(
            'name' => __('Course Categories', 'kingdom-training'),
            'singular_name' => __('Course Category', 'kingdom-training'),
            'menu_name' => __('Categories', 'kingdom-training'),
        ),
        'hierarchical' => true,
        'show_ui' => true,
        'show_admin_column' => true,
        'show_in_rest' => true,
        'rest_base' => 'strategy-course-categories',
        'rewrite' => array('slug' => 'strategy-course-category'),
    ));

    // Article Category
    register_taxonomy('article_category', 'article', array(
        'labels' => array(
            'name' => __('Article Categories', 'kingdom-training'),
            'singular_name' => __('Article Category', 'kingdom-training'),
            'menu_name' => __('Categories', 'kingdom-training'),
        ),
        'hierarchical' => true,
        'show_ui' => true,
        'show_admin_column' => true,
        'show_in_rest' => true,
        'rest_base' => 'article-categories',
        'rewrite' => array('slug' => 'article-category'),
    ));

    // Tool Category
    register_taxonomy('tool_category', 'tool', array(
        'labels' => array(
            'name' => __('Tool Categories', 'kingdom-training'),
            'singular_name' => __('Tool Category', 'kingdom-training'),
            'menu_name' => __('Categories', 'kingdom-training'),
        ),
        'hierarchical' => true,
        'show_ui' => true,
        'show_admin_column' => true,
        'show_in_rest' => true,
        'rest_base' => 'tool-categories',
        'rewrite' => array('slug' => 'tool-category'),
    ));

    // Strategy Course Post Type
    register_post_type('strategy_course', array(
        'labels' => array(
            'name' => __('Strategy Course', 'kingdom-training'),
            'singular_name' => __('Strategy Course', 'kingdom-training'),
            'add_new' => __('Add New Strategy Course', 'kingdom-training'),
            'add_new_item' => __('Add New Strategy Course', 'kingdom-training'),
            'edit_item' => __('Edit Strategy Course', 'kingdom-training'),
            'new_item' => __('New Strategy Course', 'kingdom-training'),
            'view_item' => __('View Strategy Course', 'kingdom-training'),
            'search_items' => __('Search Strategy Courses', 'kingdom-training'),
            'not_found' => __('No strategy courses found', 'kingdom-training'),
        ),
        'public' => true,
        'has_archive' => true,
        'show_in_rest' => true,
        'rest_base' => 'strategy-courses',
        'menu_icon' => 'dashicons-book-alt',
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt', 'custom-fields', 'revisions'),
        'rewrite' => array('slug' => 'strategy-courses'),
    ));

    // Articles Post Type (enhanced from default posts)
    register_post_type('article', array(
        'labels' => array(
            'name' => __('Articles', 'kingdom-training'),
            'singular_name' => __('Article', 'kingdom-training'),
            'add_new' => __('Add New Article', 'kingdom-training'),
            'add_new_item' => __('Add New Article', 'kingdom-training'),
            'edit_item' => __('Edit Article', 'kingdom-training'),
            'new_item' => __('New Article', 'kingdom-training'),
            'view_item' => __('View Article', 'kingdom-training'),
            'search_items' => __('Search Articles', 'kingdom-training'),
            'not_found' => __('No articles found', 'kingdom-training'),
        ),
        'public' => true,
        'has_archive' => true,
        'show_in_rest' => true,
        'rest_base' => 'articles',
        'menu_icon' => 'dashicons-media-document',
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt', 'custom-fields', 'author', 'revisions'),
        'rewrite' => array('slug' => 'articles'),
        'taxonomies' => array('article_category', 'post_tag'),
    ));

    // Tools Post Type
    register_post_type('tool', array(
        'labels' => array(
            'name' => __('Tools', 'kingdom-training'),
            'singular_name' => __('Tool', 'kingdom-training'),
            'add_new' => __('Add New Tool', 'kingdom-training'),
            'add_new_item' => __('Add New Tool', 'kingdom-training'),
            'edit_item' => __('Edit Tool', 'kingdom-training'),
            'new_item' => __('New Tool', 'kingdom-training'),
            'view_item' => __('View Tool', 'kingdom-training'),
            'search_items' => __('Search Tools', 'kingdom-training'),
            'not_found' => __('No tools found', 'kingdom-training'),
        ),
        'public' => true,
        'has_archive' => true,
        'show_in_rest' => true,
        'rest_base' => 'tools',
        'menu_icon' => 'dashicons-admin-tools',
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt', 'custom-fields', 'revisions'),
        'rewrite' => array('slug' => 'tools'),
        'taxonomies' => array('tool_category', 'post_tag'),
    ));
}
add_action('init', 'gaal_register_custom_post_types');

// Add custom fields to REST API
function gaal_register_custom_fields() {
    // Add featured image URL to REST API
    register_rest_field(
        array('post', 'page', 'strategy_course', 'article', 'tool'),
        'featured_image_url',
        array(
            'get_callback' => function($object) {
                if ($object['featured_media']) {
                    $image = wp_get_attachment_image_src($object['featured_media'], 'full');
                    return $image ? $image[0] : null;
                }
                return null;
            },
            'schema' => array(
                'description' => __('Featured image URL', 'kingdom-training'),
                'type' => 'string',
            ),
        )
    );

    // Add featured image sizes to REST API for responsive images
    register_rest_field(
        array('post', 'page', 'strategy_course', 'article', 'tool'),
        'featured_image_sizes',
        array(
            'get_callback' => function($object) {
                if ($object['featured_media']) {
                    $sizes = array();
                    $image_sizes = array('thumbnail', 'medium', 'medium_large', 'large', 'full');
                    foreach ($image_sizes as $size) {
                        $image = wp_get_attachment_image_src($object['featured_media'], $size);
                        if ($image) {
                            $sizes[$size] = array(
                                'url' => $image[0],
                                'width' => $image[1],
                                'height' => $image[2],
                            );
                        }
                    }
                    return !empty($sizes) ? $sizes : null;
                }
                return null;
            },
            'schema' => array(
                'description' => __('Featured image sizes for responsive images', 'kingdom-training'),
                'type' => 'object',
            ),
        )
    );

    // Add author information to REST API
    register_rest_field(
        array('post', 'article', 'strategy_course', 'tool'),
        'author_info',
        array(
            'get_callback' => function($object) {
                $author_id = $object['author'];
                return array(
                    'name' => get_the_author_meta('display_name', $author_id),
                    'avatar' => get_avatar_url($author_id),
                    'bio' => get_the_author_meta('description', $author_id),
                );
            },
            'schema' => array(
                'description' => __('Author information', 'kingdom-training'),
                'type' => 'object',
            ),
        )
    );

    // Add steps meta field to REST API for strategy courses
    register_rest_field(
        'strategy_course',
        'steps',
        array(
            'get_callback' => function($object) {
                $steps = get_post_meta($object['id'], 'steps', true);
                return $steps ? intval($steps) : null;
            },
            'update_callback' => function($value, $object) {
                if (is_numeric($value) && $value >= 1 && $value <= 20) {
                    return update_post_meta($object->ID, 'steps', intval($value));
                }
                return false;
            },
            'schema' => array(
                'description' => __('Step number (1-20) for ordering strategy course content', 'kingdom-training'),
                'type' => 'integer',
                'context' => array('view', 'edit'),
            ),
        )
    );

    // Add language information to REST API (Polylang integration)
    // Only add if Polylang is active
    // 
    // Polylang Configuration Requirements:
    // 1. Ensure Polylang plugin is installed and activated
    // 2. In Polylang settings, configure URL structure to include language code in URL
    //    (Settings > Languages > URL modifications: "The language is set from content")
    // 3. In Polylang settings, mark custom post types as translatable:
    //    - Settings > Languages > Synchronization: Enable for strategy_course, article, tool
    // 4. Set default language (typically English) in Polylang settings
    // 5. Add languages (e.g., Spanish/es) in Polylang settings
    if (function_exists('pll_get_post_language')) {
        register_rest_field(
            array('post', 'page', 'strategy_course', 'article', 'tool'),
            'language',
            array(
                'get_callback' => function($object) {
                    $lang = pll_get_post_language($object['id'], 'slug');
                    return $lang ? $lang : null;
                },
                'schema' => array(
                    'description' => __('Language code (slug) for this post', 'kingdom-training'),
                    'type' => 'string',
                    'context' => array('view', 'edit'),
                ),
            )
        );

        // Add translations field (alternate language versions)
        register_rest_field(
            array('post', 'page', 'strategy_course', 'article', 'tool'),
            'translations',
            array(
                'get_callback' => function($object) {
                    $translations = pll_get_post_translations($object['id']);
                    if (empty($translations)) {
                        return array();
                    }
                    
                    $translation_data = array();
                    foreach ($translations as $lang_code => $translation_id) {
                        // Skip the current post itself
                        if ($translation_id == $object['id']) {
                            continue;
                        }
                        
                        $translation_post = get_post($translation_id);
                        if ($translation_post && $translation_post->post_status === 'publish') {
                            $translation_data[] = array(
                                'id' => $translation_id,
                                'slug' => $translation_post->post_name,
                                'language' => $lang_code,
                                'link' => get_permalink($translation_id),
                            );
                        }
                    }
                    
                    return $translation_data;
                },
                'schema' => array(
                    'description' => __('Array of alternate language versions of this post', 'kingdom-training'),
                    'type' => 'array',
                    'items' => array(
                        'type' => 'object',
                        'properties' => array(
                            'id' => array('type' => 'integer'),
                            'slug' => array('type' => 'string'),
                            'language' => array('type' => 'string'),
                            'link' => array('type' => 'string', 'format' => 'uri'),
                        ),
                    ),
                    'context' => array('view', 'edit'),
                ),
            )
        );
    }
}
add_action('rest_api_init', 'gaal_register_custom_fields');

// Ensure content is always included in REST API for custom post types
// This ensures the content field is always available in the API response
function gaal_rest_ensure_content($response, $post, $request) {
    // Only modify our custom post types
    $post_types = array('strategy_course', 'article', 'tool');
    
    if (in_array($post->post_type, $post_types)) {
        // Ensure content.rendered is always present and properly formatted
        if (isset($response->data['content'])) {
            // Make sure content.rendered exists and has the actual content
            if (empty($response->data['content']['rendered']) && !empty($post->post_content)) {
                $response->data['content']['rendered'] = apply_filters('the_content', $post->post_content);
            }
        } else {
            // Content field missing entirely, add it
            $response->data['content'] = array(
                'rendered' => apply_filters('the_content', $post->post_content),
                'protected' => false,
            );
        }
        
        // Ensure excerpt.rendered is always present
        if (isset($response->data['excerpt'])) {
            if (empty($response->data['excerpt']['rendered'])) {
                $excerpt = !empty($post->post_excerpt) ? $post->post_excerpt : wp_trim_words($post->post_content, 55);
                $response->data['excerpt']['rendered'] = apply_filters('the_excerpt', $excerpt);
            }
        } else {
            $excerpt = !empty($post->post_excerpt) ? $post->post_excerpt : wp_trim_words($post->post_content, 55);
            $response->data['excerpt'] = array(
                'rendered' => apply_filters('the_excerpt', $excerpt),
                'protected' => false,
            );
        }
    }
    
    return $response;
}
add_filter('rest_prepare_strategy_course', 'gaal_rest_ensure_content', 10, 3);
add_filter('rest_prepare_article', 'gaal_rest_ensure_content', 10, 3);
add_filter('rest_prepare_tool', 'gaal_rest_ensure_content', 10, 3);

// Ensure content field is always included in REST API context
function gaal_rest_include_content_in_context() {
    $post_types = array('strategy_course', 'article', 'tool');
    
    foreach ($post_types as $post_type) {
        $post_type_obj = get_post_type_object($post_type);
        if ($post_type_obj) {
            // Ensure content is in the view context
            add_filter("rest_{$post_type}_collection_params", function($query_params, $post_type_obj) {
                // This ensures content is included in list views
                return $query_params;
            }, 10, 2);
        }
    }
}
add_action('rest_api_init', 'gaal_rest_include_content_in_context', 20);

// Add menu items to REST API
function gaal_register_menu_api() {
    register_rest_route('gaal/v1', '/menus/(?P<location>[a-zA-Z0-9_-]+)', array(
        'methods' => 'GET',
        'callback' => function($request) {
            $location = $request['location'];
            $locations = get_nav_menu_locations();
            
            if (!isset($locations[$location])) {
                return new WP_Error('menu_not_found', 'Menu location not found', array('status' => 404));
            }
            
            $menu_items = wp_get_nav_menu_items($locations[$location]);
            
            if (!$menu_items) {
                return array();
            }
            
            $menu_data = array();
            foreach ($menu_items as $item) {
                $menu_data[] = array(
                    'id' => $item->ID,
                    'title' => $item->title,
                    'url' => $item->url,
                    'parent' => $item->menu_item_parent,
                    'order' => $item->menu_order,
                );
            }
            
            return $menu_data;
        },
        'permission_callback' => '__return_true',
    ));
}
add_action('rest_api_init', 'gaal_register_menu_api');

// Add site options to REST API
function gaal_register_site_options_api() {
    register_rest_route('gaal/v1', '/site-info', array(
        'methods' => 'GET',
        'callback' => function() {
            return array(
                'name' => get_bloginfo('name'),
                'description' => get_bloginfo('description'),
                'url' => get_bloginfo('url'),
                'logo' => get_theme_mod('custom_logo') ? wp_get_attachment_image_url(get_theme_mod('custom_logo'), 'full') : null,
            );
        },
        'permission_callback' => '__return_true',
    ));
}
add_action('rest_api_init', 'gaal_register_site_options_api');

// Register Authentication API endpoints
function gaal_register_auth_api() {
    // Login endpoint
    register_rest_route('gaal/v1', '/auth/login', array(
        'methods' => 'POST',
        'callback' => function($request) {
            $username = $request->get_param('username');
            $password = $request->get_param('password');
            
            if (empty($username) || empty($password)) {
                return new WP_Error('missing_credentials', 'Username and password are required', array('status' => 400));
            }
            
            // Attempt to authenticate
            $user = wp_authenticate($username, $password);
            
            if (is_wp_error($user)) {
                return new WP_Error('invalid_credentials', 'Invalid username or password', array('status' => 401));
            }
            
            // Set authentication cookies
            wp_set_current_user($user->ID);
            wp_set_auth_cookie($user->ID, true);
            
            // Return user data
            // Get user roles
            $roles = $user->roles;
            
            return array(
                'id' => $user->ID,
                'name' => $user->display_name,
                'email' => $user->user_email,
                'avatar' => get_avatar_url($user->ID),
                'capabilities' => $user->allcaps,
                'roles' => $roles,
            );
        },
        'permission_callback' => '__return_true',
    ));
    
    // Logout endpoint
    register_rest_route('gaal/v1', '/auth/logout', array(
        'methods' => 'POST',
        'callback' => function($request) {
            wp_logout();
            return array('success' => true, 'message' => 'Logged out successfully');
        },
        'permission_callback' => '__return_true',
    ));
    
    // Get current user endpoint
    register_rest_route('gaal/v1', '/auth/me', array(
        'methods' => 'GET',
        'callback' => function($request) {
            // WordPress should already have loaded the user session
            // Just get the current user ID - WordPress handles cookie authentication automatically
            $user_id = get_current_user_id();
            
            // If no user ID, return null (not an error) so frontend can handle gracefully
            if (!$user_id || $user_id === 0) {
                // Return 200 OK with null to avoid 401 errors
                return new WP_REST_Response(null, 200);
            }
            
            $user = get_userdata($user_id);
            
            if (!$user) {
                return new WP_REST_Response(null, 200);
            }
            
            // Get user roles
            $roles = $user->roles;
            
            return new WP_REST_Response(array(
                'id' => $user->ID,
                'name' => $user->display_name,
                'email' => $user->user_email,
                'avatar' => get_avatar_url($user->ID),
                'capabilities' => $user->allcaps,
                'roles' => $roles,
            ), 200);
        },
        'permission_callback' => '__return_true',
    ));
}
add_action('rest_api_init', 'gaal_register_auth_api');

// Brevo API Integration Functions
/**
 * Get Brevo API key from WordPress options
 */
function gaal_get_brevo_api_key() {
    return get_option('gaal_brevo_api_key', '');
}

/**
 * Get Brevo list ID from WordPress options
 */
function gaal_get_brevo_list_id() {
    $list_id = get_option('gaal_brevo_list_id', '');
    // Convert to integer if it's a valid number
    return is_numeric($list_id) ? intval($list_id) : $list_id;
}

/**
 * Submit contact to Brevo API
 * 
 * @param string $email Contact email address
 * @param string $name Contact name (optional)
 * @return array|WP_Error Response from Brevo API or WP_Error on failure
 */
function gaal_subscribe_to_brevo($email, $name = '') {
    $api_key = gaal_get_brevo_api_key();
    $list_id = gaal_get_brevo_list_id();
    
    // Check if Brevo is configured
    if (empty($api_key)) {
        return new WP_Error('brevo_not_configured', 'Brevo API key is not configured', array('status' => 500));
    }
    
    // Prepare name attributes
    $attributes = array();
    if (!empty($name)) {
        // Split name into first and last name if space exists
        $name_parts = explode(' ', trim($name), 2);
        $attributes['FIRSTNAME'] = $name_parts[0];
        if (isset($name_parts[1])) {
            $attributes['LASTNAME'] = $name_parts[1];
        }
    }
    
    // Prepare request body
    $body = array(
        'email' => $email,
        'updateEnabled' => true, // Update contact if already exists
    );
    
    if (!empty($attributes)) {
        $body['attributes'] = $attributes;
    }
    
    // Add list ID if configured
    if (!empty($list_id)) {
        $body['listIds'] = array($list_id);
    }
    
    // Make API request to Brevo
    $url = 'https://api.brevo.com/v3/contacts';
    $args = array(
        'method' => 'POST',
        'headers' => array(
            'Content-Type' => 'application/json',
            'api-key' => $api_key,
        ),
        'body' => json_encode($body),
        'timeout' => 15,
    );
    
    $response = wp_remote_request($url, $args);
    
    // Handle errors
    if (is_wp_error($response)) {
        error_log('Brevo API Error: ' . $response->get_error_message());
        return new WP_Error('brevo_api_error', 'Failed to connect to Brevo API: ' . $response->get_error_message(), array('status' => 500));
    }
    
    $response_code = wp_remote_retrieve_response_code($response);
    $response_body = wp_remote_retrieve_body($response);
    $response_data = json_decode($response_body, true);
    
    // Handle successful responses
    if ($response_code === 201 || $response_code === 200 || $response_code === 204) {
        // Success - contact created or updated
        return array(
            'success' => true,
            'code' => $response_code,
            'data' => $response_data,
        );
    }
    
    // Handle error responses
    $error_message = 'Unknown error';
    if (isset($response_data['message'])) {
        $error_message = $response_data['message'];
    } elseif (isset($response_data['error'])) {
        $error_message = is_array($response_data['error']) ? json_encode($response_data['error']) : $response_data['error'];
    }
    
    error_log('Brevo API Error Response: ' . $error_message . ' (Code: ' . $response_code . ')');
    
    // Handle specific error cases
    if ($response_code === 400) {
        return new WP_Error('brevo_invalid_request', 'Invalid request to Brevo: ' . $error_message, array('status' => 400));
    } elseif ($response_code === 401) {
        return new WP_Error('brevo_unauthorized', 'Brevo API key is invalid', array('status' => 401));
    } elseif ($response_code === 404) {
        return new WP_Error('brevo_not_found', 'Brevo resource not found: ' . $error_message, array('status' => 404));
    } else {
        return new WP_Error('brevo_api_error', 'Brevo API error: ' . $error_message, array('status' => $response_code));
    }
}

// Register Brevo Settings in WordPress Admin
function gaal_add_brevo_settings() {
    add_options_page(
        __('Brevo Newsletter Settings', 'kingdom-training'),
        __('Brevo Newsletter', 'kingdom-training'),
        'manage_options',
        'gaal-brevo-settings',
        'gaal_brevo_settings_page'
    );
}
add_action('admin_menu', 'gaal_add_brevo_settings');

/**
 * Render Brevo settings page
 */
function gaal_brevo_settings_page() {
    // Save settings if form was submitted
    if (isset($_POST['gaal_brevo_settings_submit']) && check_admin_referer('gaal_brevo_settings')) {
        $api_key = sanitize_text_field($_POST['gaal_brevo_api_key'] ?? '');
        $list_id = sanitize_text_field($_POST['gaal_brevo_list_id'] ?? '');
        
        update_option('gaal_brevo_api_key', $api_key);
        update_option('gaal_brevo_list_id', $list_id);
        
        echo '<div class="notice notice-success"><p>' . __('Settings saved successfully!', 'kingdom-training') . '</p></div>';
    }
    
    $api_key = gaal_get_brevo_api_key();
    $list_id = gaal_get_brevo_list_id();
    ?>
    <div class="wrap">
        <h1><?php echo esc_html__('Brevo Newsletter Settings', 'kingdom-training'); ?></h1>
        <form method="post" action="">
            <?php wp_nonce_field('gaal_brevo_settings'); ?>
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="gaal_brevo_api_key"><?php echo esc_html__('Brevo API Key', 'kingdom-training'); ?></label>
                    </th>
                    <td>
                        <input type="text" 
                               id="gaal_brevo_api_key" 
                               name="gaal_brevo_api_key" 
                               value="<?php echo esc_attr($api_key); ?>" 
                               class="regular-text"
                               placeholder="xkeysib-...">
                        <p class="description">
                            <?php echo esc_html__('Enter your Brevo API key. You can find this in your Brevo account under SMTP & API > API keys.', 'kingdom-training'); ?>
                        </p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="gaal_brevo_list_id"><?php echo esc_html__('Brevo List ID', 'kingdom-training'); ?></label>
                    </th>
                    <td>
                        <input type="text" 
                               id="gaal_brevo_list_id" 
                               name="gaal_brevo_list_id" 
                               value="<?php echo esc_attr($list_id); ?>" 
                               class="regular-text"
                               placeholder="1">
                        <p class="description">
                            <?php echo esc_html__('Enter the ID of the Brevo list where contacts should be added. Leave empty if you want to add contacts without assigning them to a list.', 'kingdom-training'); ?>
                        </p>
                    </td>
                </tr>
            </table>
            <?php submit_button(__('Save Settings', 'kingdom-training'), 'primary', 'gaal_brevo_settings_submit'); ?>
        </form>
        <div class="card" style="max-width: 800px; margin-top: 20px;">
            <h2><?php echo esc_html__('How to Get Your Brevo API Key', 'kingdom-training'); ?></h2>
            <ol>
                <li><?php echo esc_html__('Log into your Brevo account', 'kingdom-training'); ?></li>
                <li><?php echo esc_html__('Navigate to Settings > SMTP & API', 'kingdom-training'); ?></li>
                <li><?php echo esc_html__('Click on the "API keys" tab', 'kingdom-training'); ?></li>
                <li><?php echo esc_html__('Click "Generate a new API key"', 'kingdom-training'); ?></li>
                <li><?php echo esc_html__('Name your API key and click "Generate"', 'kingdom-training'); ?></li>
                <li><?php echo esc_html__('Copy the generated API key and paste it above', 'kingdom-training'); ?></li>
            </ol>
            <h2><?php echo esc_html__('How to Find Your List ID', 'kingdom-training'); ?></h2>
            <ol>
                <li><?php echo esc_html__('Log into your Brevo account', 'kingdom-training'); ?></li>
                <li><?php echo esc_html__('Navigate to Contacts > Lists', 'kingdom-training'); ?></li>
                <li><?php echo esc_html__('Click on the list you want to use', 'kingdom-training'); ?></li>
                <li><?php echo esc_html__('The List ID is shown in the URL or list details', 'kingdom-training'); ?></li>
            </ol>
        </div>
    </div>
    <?php
}

// Register Newsletter Subscription API endpoint
function gaal_register_newsletter_api() {
    // Newsletter subscription endpoint
    register_rest_route('gaal/v1', '/newsletter/subscribe', array(
        'methods' => 'POST',
        'callback' => function($request) {
            $email = sanitize_email($request->get_param('email'));
            $name = sanitize_text_field($request->get_param('name'));
            
            // Validate email
            if (empty($email) || !is_email($email)) {
                return new WP_Error('invalid_email', 'Please provide a valid email address', array('status' => 400));
            }
            
            // Submit to Brevo API
            $brevo_result = gaal_subscribe_to_brevo($email, $name);
            
            // If Brevo is configured and there's an error, log it but continue with local storage
            $brevo_success = false;
            if (!is_wp_error($brevo_result)) {
                $brevo_success = true;
            } else {
                // Log Brevo errors but don't fail the subscription
                // This allows the subscription to work even if Brevo is temporarily unavailable
                error_log('Brevo subscription failed for ' . $email . ': ' . $brevo_result->get_error_message());
            }
            
            // Store subscriber data locally as backup
            $subscribers = get_option('gaal_newsletter_subscribers', array());
            
            // Check if email already exists locally
            $email_exists = false;
            foreach ($subscribers as $index => $subscriber) {
                if (isset($subscriber['email']) && strtolower($subscriber['email']) === strtolower($email)) {
                    // Update existing subscriber
                    $subscribers[$index] = array(
                        'email' => $email,
                        'name' => $name,
                        'subscribed_at' => $subscriber['subscribed_at'] ?? current_time('mysql'),
                        'updated_at' => current_time('mysql'),
                        'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '',
                        'brevo_synced' => $brevo_success,
                    );
                    $email_exists = true;
                    break;
                }
            }
            
            // Add new subscriber if not exists
            if (!$email_exists) {
                $subscriber_data = array(
                    'email' => $email,
                    'name' => $name,
                    'subscribed_at' => current_time('mysql'),
                    'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '',
                    'brevo_synced' => $brevo_success,
                );
                $subscribers[] = $subscriber_data;
            }
            
            // Save subscribers list
            update_option('gaal_newsletter_subscribers', $subscribers);
            
            // If Brevo sync failed but we have a configured API key, return error
            // This ensures users know if there's a configuration issue
            if (is_wp_error($brevo_result) && !empty(gaal_get_brevo_api_key())) {
                // Check if it's a configuration error (401) or a temporary issue
                $error_code = $brevo_result->get_error_code();
                if (in_array($error_code, array('brevo_unauthorized', 'brevo_not_configured'))) {
                    // Configuration error - return error to user
                    return new WP_Error(
                        'brevo_config_error',
                        'Newsletter subscription service is not properly configured. Please contact the administrator.',
                        array('status' => 500)
                    );
                }
                // For other errors (network, etc.), still succeed but log
            }
            
            // Return success response
            return array(
                'success' => true,
                'message' => 'Successfully subscribed to newsletter',
                'email' => $email,
                'brevo_synced' => $brevo_success,
            );
        },
        'permission_callback' => '__return_true',
    ));
    
    // Get newsletter subscribers (admin only)
    register_rest_route('gaal/v1', '/newsletter/subscribers', array(
        'methods' => 'GET',
        'callback' => function($request) {
            // Check if user is admin
            if (!current_user_can('manage_options')) {
                return new WP_Error('forbidden', 'You do not have permission to view subscribers', array('status' => 403));
            }
            
            $subscribers = get_option('gaal_newsletter_subscribers', array());
            return array(
                'success' => true,
                'count' => count($subscribers),
                'subscribers' => $subscribers,
            );
        },
        'permission_callback' => '__return_true',
    ));
}
add_action('rest_api_init', 'gaal_register_newsletter_api');

// Register shortcode processing endpoint
function gaal_register_shortcode_api() {
    register_rest_route('gaal/v1', '/shortcode/render', array(
        'methods' => 'POST',
        'callback' => function($request) {
            $shortcode = sanitize_text_field($request->get_param('shortcode'));
            
            if (empty($shortcode)) {
                return new WP_Error('missing_shortcode', 'Shortcode is required', array('status' => 400));
            }
            
            // Process the shortcode
            // Note: do_shortcode() processes WordPress shortcodes and returns the rendered HTML
            $rendered = do_shortcode($shortcode);
            
            return array(
                'success' => true,
                'html' => $rendered,
            );
        },
        'permission_callback' => '__return_true',
    ));
}
add_action('rest_api_init', 'gaal_register_shortcode_api');

// Add Translation meta box
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
// DISABLED: Translation meta box removed from post type sidebars - keeping settings page only
// add_action('add_meta_boxes', 'gaal_add_translation_meta_box');

// Enqueue admin scripts and styles for translation meta box
function gaal_enqueue_translation_admin_assets($hook) {
    // Only load on post edit pages
    if (!in_array($hook, array('post.php', 'post-new.php'))) {
        return;
    }
    
    global $post;
    if (!$post) {
        return;
    }
    
    // Only load for our custom post types
    $post_types = array('strategy_course', 'article', 'tool');
    if (!in_array($post->post_type, $post_types)) {
        return;
    }
    
    wp_enqueue_script(
        'gaal-translation-admin',
        get_template_directory_uri() . '/admin/js/translation-admin.js',
        array('jquery'),
        '1.0.0',
        true
    );
    
    wp_enqueue_style(
        'gaal-translation-admin',
        get_template_directory_uri() . '/admin/css/translation-admin.css',
        array(),
        '1.0.0'
    );
    
    // Localize script with data
    wp_localize_script('gaal-translation-admin', 'gaalTranslation', array(
        'apiUrl' => rest_url('gaal/v1/translate/'),
        'nonce' => wp_create_nonce('wp_rest'),
        'postId' => $post->ID,
        'strings' => array(
            'generateAll' => __('Generate All Translations', 'kingdom-training'),
            'translateSingle' => __('Translate', 'kingdom-training'),
            'retranslate' => __('Re-translate', 'kingdom-training'),
            'retranslating' => __('Translating...', 'kingdom-training'),
            'retranslateSuccess' => __('Content re-translated successfully!', 'kingdom-training'),
            'confirmRetranslate' => __('This will overwrite the current title, content, and excerpt with a fresh translation from Google Translate. Continue?', 'kingdom-training'),
            'resume' => __('Resume', 'kingdom-training'),
            'loading' => __('Loading...', 'kingdom-training'),
            'success' => __('Success', 'kingdom-training'),
            'error' => __('Error', 'kingdom-training'),
            'inProgress' => __('In Progress', 'kingdom-training'),
            'completed' => __('Completed', 'kingdom-training'),
            'pending' => __('Pending', 'kingdom-training'),
            'failed' => __('Failed', 'kingdom-training'),
            'copyFromEnglish' => __('Copy Content from English', 'kingdom-training'),
            'copying' => __('Copying...', 'kingdom-training'),
            'copySuccess' => __('Content copied successfully!', 'kingdom-training'),
            'confirmCopy' => __('This will overwrite the current title, content, and excerpt with the English version. Continue?', 'kingdom-training'),
            // Chunked translation progress strings
            'stepInit' => __('Initializing...', 'kingdom-training'),
            'stepTitle' => __('Translating title...', 'kingdom-training'),
            'stepContent' => __('Translating content chunk %d...', 'kingdom-training'),
            'stepExcerpt' => __('Translating excerpt...', 'kingdom-training'),
            'stepFinalize' => __('Finalizing...', 'kingdom-training'),
            'stepProgress' => __('Step %1$d of %2$d: %3$s', 'kingdom-training'),
            'translationComplete' => __('Translation completed!', 'kingdom-training'),
            'translationFailed' => __('Translation failed at step: %s', 'kingdom-training'),
        ),
    ));
}
// DISABLED: Translation admin assets not needed since meta box is disabled
// add_action('admin_enqueue_scripts', 'gaal_enqueue_translation_admin_assets');

// Translation meta box callback
function gaal_translation_meta_box_callback($post) {
    // Get current language
    $current_language = 'en';
    if (function_exists('pll_get_post_language')) {
        $current_language = pll_get_post_language($post->ID, 'slug') ?: 'en';
    }
    
    // Get enabled languages
    $enabled_languages = get_option('gaal_translation_enabled_languages', array());
    
    // Get available languages from Polylang
    $available_languages = array();
    if (function_exists('PLL') && isset(PLL()->model)) {
        // Get full language objects from Polylang
        $languages = PLL()->model->get_languages_list();
        foreach ($languages as $lang) {
            $available_languages[$lang->slug] = $lang->name;
        }
    } elseif (function_exists('pll_languages_list')) {
        // Fallback: get language slugs and retrieve language data
        $language_slugs = pll_languages_list();
        foreach ($language_slugs as $slug) {
            if (function_exists('PLL') && isset(PLL()->model)) {
                $lang = PLL()->model->get_language($slug);
                if ($lang) {
                    $available_languages[$lang->slug] = $lang->name;
                }
            } else {
                // Last resort: use slug as name
                $available_languages[$slug] = strtoupper($slug);
            }
        }
    }
    
    // Get translation status
    $translations = array();
    if (function_exists('pll_get_post_translations')) {
        $post_translations = pll_get_post_translations($post->ID);
        if ($post_translations) {
            foreach ($post_translations as $lang => $trans_id) {
                if ($lang !== $current_language) {
                    $trans_post = get_post($trans_id);
                    $translations[$lang] = array(
                        'post_id' => $trans_id,
                        'status' => $trans_post ? $trans_post->post_status : 'missing',
                        'title' => $trans_post ? $trans_post->post_title : '',
                    );
                }
            }
        }
    }
    
    // Get English source post for non-English posts
    $english_source_post = null;
    $english_source_post_id = null;
    $debug_translations = array(); // Debug info
    $debug_pll_get_post = null; // Debug: result from pll_get_post
    
    if ($current_language !== 'en') {
        // Method 1: Try pll_get_post_translations
        if (function_exists('pll_get_post_translations')) {
            $all_translations = pll_get_post_translations($post->ID);
            $debug_translations = $all_translations;
            if (isset($all_translations['en'])) {
                $english_source_post_id = $all_translations['en'];
                $english_source_post = get_post($english_source_post_id);
            }
        }
        
        // Method 2: If not found, try pll_get_post (direct lookup)
        if (!$english_source_post_id && function_exists('pll_get_post')) {
            $debug_pll_get_post = pll_get_post($post->ID, 'en');
            if ($debug_pll_get_post && $debug_pll_get_post != $post->ID) {
                $english_source_post_id = $debug_pll_get_post;
                $english_source_post = get_post($english_source_post_id);
            }
        }
    }
    
    ?>
    <div class="gaal-translation-meta-box">
        <p>
            <strong><?php echo esc_html__('Current Language:', 'kingdom-training'); ?></strong>
            <?php echo esc_html($available_languages[$current_language] ?? $current_language); ?>
        </p>
        
        <?php // Show "Copy from English" and "Re-translate" sections for non-English posts ?>
        <?php if ($current_language !== 'en'): ?>
            <?php 
            // Get the language name for display
            $current_language_name = isset($available_languages[$current_language]) 
                ? $available_languages[$current_language] 
                : strtoupper($current_language);
            ?>
            <div class="gaal-copy-from-english" style="margin-bottom: 15px; padding: 10px; background: #f0f6fc; border-left: 3px solid #0073aa;">
                <h4 style="margin: 0 0 8px 0; font-size: 13px;"><?php echo esc_html__('Translation from English', 'kingdom-training'); ?></h4>
                <?php if ($english_source_post): ?>
                    <p style="margin: 0 0 8px 0; font-size: 12px;">
                        <strong><?php echo esc_html__('English version:', 'kingdom-training'); ?></strong>
                        <a href="<?php echo esc_url(get_edit_post_link($english_source_post_id)); ?>" target="_blank">
                            <?php echo esc_html($english_source_post->post_title); ?>
                        </a>
                    </p>
                    
                    <?php // Re-translate button ?>
                    <button type="button" class="button button-primary gaal-retranslate-btn" 
                            data-source-id="<?php echo esc_attr($english_source_post_id); ?>"
                            data-target-language="<?php echo esc_attr($current_language); ?>"
                            data-language-name="<?php echo esc_attr($current_language_name); ?>"
                            style="width: 100%; margin-bottom: 8px;">
                        <?php 
                        /* translators: %s: language name */
                        printf(esc_html__('Re-translate into %s', 'kingdom-training'), esc_html($current_language_name)); 
                        ?>
                    </button>
                    <p class="description" style="margin-top: 0; margin-bottom: 10px; font-size: 11px;">
                        <?php echo esc_html__('Get a fresh translation from Google Translate using the English version.', 'kingdom-training'); ?>
                    </p>
                    
                    <?php // Copy from English button ?>
                    <button type="button" class="button gaal-copy-from-english-btn" data-source-id="<?php echo esc_attr($english_source_post_id); ?>" style="width: 100%;">
                        <?php echo esc_html__('Copy Content from English (no translation)', 'kingdom-training'); ?>
                    </button>
                    <p class="description" style="margin-top: 5px; font-size: 11px;">
                        <?php echo esc_html__('This will copy the raw English title, content, and excerpt without translation.', 'kingdom-training'); ?>
                    </p>
                <?php else: ?>
                    <p class="description" style="margin: 0;">
                        <?php echo esc_html__('No English version linked to this post.', 'kingdom-training'); ?>
                    </p>
                    <?php if (current_user_can('manage_options')): ?>
                        <details style="margin-top: 8px; font-size: 11px;">
                            <summary style="cursor: pointer; color: #666;"><?php echo esc_html__('Debug Info', 'kingdom-training'); ?></summary>
                            <div style="margin-top: 5px; padding: 5px; background: #fff; border: 1px solid #ddd; font-family: monospace; font-size: 10px;">
                                <p style="margin: 0 0 5px 0;"><strong>Post ID:</strong> <?php echo esc_html($post->ID); ?></p>
                                <p style="margin: 0 0 5px 0;"><strong>Current Lang:</strong> <?php echo esc_html($current_language); ?></p>
                                <p style="margin: 0 0 5px 0;"><strong>pll_get_post_translations exists:</strong> <?php echo function_exists('pll_get_post_translations') ? 'Yes' : 'No'; ?></p>
                                <p style="margin: 0 0 5px 0;"><strong>pll_get_post_translations result:</strong> 
                                    <?php 
                                    if (empty($debug_translations)) {
                                        echo 'None';
                                    } else {
                                        $trans_info = array();
                                        foreach ($debug_translations as $lang => $trans_id) {
                                            $trans_info[] = $lang . '=' . $trans_id;
                                        }
                                        echo esc_html(implode(', ', $trans_info));
                                    }
                                    ?>
                                </p>
                                <p style="margin: 0 0 5px 0;"><strong>pll_get_post exists:</strong> <?php echo function_exists('pll_get_post') ? 'Yes' : 'No'; ?></p>
                                <p style="margin: 0 0 5px 0;"><strong>pll_get_post(<?php echo $post->ID; ?>, 'en') result:</strong> <?php echo esc_html($debug_pll_get_post !== null ? ($debug_pll_get_post ?: 'false/empty') : 'Not called'); ?></p>
                                <?php 
                                // Also check the translation term directly
                                $translation_term = null;
                                if (function_exists('PLL') && isset(PLL()->model)) {
                                    $translation_term = PLL()->model->post->get_translation_term($post->ID);
                                }
                                ?>
                                <p style="margin: 0;"><strong>Translation term ID:</strong> <?php echo esc_html($translation_term ? $translation_term : 'None'); ?></p>
                            </div>
                        </details>
                    <?php endif; ?>
                <?php endif; ?>
            </div>
        <?php endif; ?>
        
        <?php if (empty($enabled_languages)): ?>
            <p class="description">
                <?php echo esc_html__('No languages enabled for translation. Please configure in Settings → Translation Automation.', 'kingdom-training'); ?>
            </p>
        <?php else: ?>
            <div class="gaal-translation-actions">
                <button type="button" class="button button-primary gaal-generate-all" style="width: 100%; margin-bottom: 10px;">
                    <?php echo esc_html__('Generate All Translations', 'kingdom-training'); ?>
                </button>
            </div>
            
            <div class="gaal-translation-status">
                <h4><?php echo esc_html__('Translation Status', 'kingdom-training'); ?></h4>
                <ul class="gaal-translation-languages">
                    <?php foreach ($enabled_languages as $lang): ?>
                        <?php if ($lang === $current_language) continue; ?>
                        <li class="gaal-translation-language" data-language="<?php echo esc_attr($lang); ?>">
                            <strong><?php echo esc_html($available_languages[$lang] ?? $lang); ?>:</strong>
                            <span class="gaal-translation-status-text">
                                <?php if (isset($translations[$lang])): ?>
                                    <?php 
                                    $status = $translations[$lang]['status'];
                                    $status_label = $status === 'publish' ? __('Published', 'kingdom-training') : 
                                                   ($status === 'draft' ? __('Draft', 'kingdom-training') : 
                                                   ($status === 'pending' ? __('Pending', 'kingdom-training') : __('Unknown', 'kingdom-training')));
                                    ?>
                                    <span class="status-<?php echo esc_attr($status); ?>"><?php echo esc_html($status_label); ?></span>
                                    <a href="<?php echo esc_url(get_edit_post_link($translations[$lang]['post_id'])); ?>" target="_blank">
                                        <?php echo esc_html__('Edit', 'kingdom-training'); ?>
                                    </a>
                                <?php else: ?>
                                    <span class="status-missing"><?php echo esc_html__('Not translated', 'kingdom-training'); ?></span>
                                <?php endif; ?>
                            </span>
                            <button type="button" class="button button-small gaal-translate-single" data-language="<?php echo esc_attr($lang); ?>" style="margin-left: 5px;">
                                <?php echo esc_html__('Translate', 'kingdom-training'); ?>
                            </button>
                        </li>
                    <?php endforeach; ?>
                </ul>
            </div>
            
            <!-- Progress bar for chunked translation -->
            <div class="gaal-progress-container" style="display: none; margin-top: 10px; padding: 10px; background: #f0f0f1; border-radius: 4px;">
                <div class="gaal-progress-bar-wrapper" style="background: #dcdcde; border-radius: 3px; height: 20px; overflow: hidden;">
                    <div class="gaal-progress-bar" style="background: #2271b1; height: 100%; width: 0%; transition: width 0.3s ease;"></div>
                </div>
                <div class="gaal-progress-text" style="margin-top: 8px; font-size: 12px; color: #50575e; text-align: center;">
                    <?php echo esc_html__('Preparing translation...', 'kingdom-training'); ?>
                </div>
            </div>
            
            <div class="gaal-translation-messages" style="margin-top: 10px;"></div>
        <?php endif; ?>
    </div>
    <?php
}

// Add Steps meta box for Strategy Course post type
function gaal_add_steps_meta_box() {
    add_meta_box(
        'steps_meta_box',
        __('Step Number', 'kingdom-training'),
        'gaal_steps_meta_box_callback',
        'strategy_course',
        'side',
        'default'
    );
}
add_action('add_meta_boxes', 'gaal_add_steps_meta_box');

// Meta box callback function
function gaal_steps_meta_box_callback($post) {
    // Add nonce for security
    wp_nonce_field('gaal_save_steps_meta_box', 'gaal_steps_meta_box_nonce');
    
    // Get current value
    $steps = get_post_meta($post->ID, 'steps', true);
    $steps = $steps ? intval($steps) : '';
    
    // Create dropdown
    echo '<label for="steps_field">' . __('Select step number:', 'kingdom-training') . '</label>';
    echo '<select name="steps_field" id="steps_field" style="width: 100%; margin-top: 5px;">';
    echo '<option value="">' . __('None', 'kingdom-training') . '</option>';
    
    for ($i = 1; $i <= 20; $i++) {
        $selected = ($steps == $i) ? 'selected="selected"' : '';
        echo '<option value="' . esc_attr($i) . '" ' . $selected . '>' . esc_html($i) . '</option>';
    }
    
    echo '</select>';
    echo '<p class="description">' . __('Select a step number (1-20) to control the order of this course content.', 'kingdom-training') . '</p>';
}

// Save steps meta box data
function gaal_save_steps_meta_box($post_id) {
    // Check nonce
    if (!isset($_POST['gaal_steps_meta_box_nonce']) || 
        !wp_verify_nonce($_POST['gaal_steps_meta_box_nonce'], 'gaal_save_steps_meta_box')) {
        return;
    }
    
    // Check if this is an autosave
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    
    // Check user permissions
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }
    
    // Check if this is a strategy_course post type
    if (get_post_type($post_id) !== 'strategy_course') {
        return;
    }
    
    // Save the meta field
    if (isset($_POST['steps_field'])) {
        $steps = sanitize_text_field($_POST['steps_field']);
        
        // Validate that it's a number between 1 and 20
        if ($steps === '' || (is_numeric($steps) && intval($steps) >= 1 && intval($steps) <= 20)) {
            if ($steps === '') {
                delete_post_meta($post_id, 'steps');
            } else {
                update_post_meta($post_id, 'steps', intval($steps));
            }
        }
    } else {
        // If field is not set, delete the meta
        delete_post_meta($post_id, 'steps');
    }
}
add_action('save_post', 'gaal_save_steps_meta_box');

// Add Steps column to Strategy Course admin list table
function gaal_add_steps_column($columns) {
    // Insert Steps column after Title
    $new_columns = array();
    foreach ($columns as $key => $value) {
        $new_columns[$key] = $value;
        if ($key === 'title') {
            $new_columns['steps'] = __('Step', 'kingdom-training');
        }
    }
    // If title column wasn't found, add steps at the beginning
    if (!isset($new_columns['steps'])) {
        $new_columns = array_merge(array('steps' => __('Step', 'kingdom-training')), $columns);
    }
    return $new_columns;
}
add_filter('manage_strategy_course_posts_columns', 'gaal_add_steps_column');

// Populate Steps column with step number
function gaal_populate_steps_column($column, $post_id) {
    if ($column === 'steps') {
        $steps = get_post_meta($post_id, 'steps', true);
        if ($steps) {
            echo '<strong>' . esc_html(intval($steps)) . '</strong>';
        } else {
            echo '<span style="color: #999;">—</span>';
        }
    }
}
add_action('manage_strategy_course_posts_custom_column', 'gaal_populate_steps_column', 10, 2);

// Make Steps column sortable
function gaal_make_steps_column_sortable($columns) {
    $columns['steps'] = 'steps';
    return $columns;
}
add_filter('manage_edit-strategy_course_sortable_columns', 'gaal_make_steps_column_sortable');

// Handle sorting by steps meta field
function gaal_sort_posts_by_steps($query) {
    if (!is_admin() || !$query->is_main_query()) {
        return;
    }
    
    if ($query->get('orderby') === 'steps') {
        $query->set('meta_key', 'steps');
        $query->set('orderby', 'meta_value_num');
    }
}
add_action('pre_get_posts', 'gaal_sort_posts_by_steps');

// Add Featured Image column to Strategy Course admin list table
function gaal_add_featured_image_column_strategy_course($columns) {
    // Insert Featured Image column after Title
    $new_columns = array();
    foreach ($columns as $key => $value) {
        $new_columns[$key] = $value;
        if ($key === 'title') {
            $new_columns['featured_image'] = __('Featured Image', 'kingdom-training');
        }
    }
    // If title column wasn't found, add featured_image at the beginning
    if (!isset($new_columns['featured_image'])) {
        $new_columns = array_merge(array('featured_image' => __('Featured Image', 'kingdom-training')), $columns);
    }
    return $new_columns;
}
add_filter('manage_strategy_course_posts_columns', 'gaal_add_featured_image_column_strategy_course');

// Populate Featured Image column for Strategy Course
function gaal_populate_featured_image_column_strategy_course($column, $post_id) {
    if ($column === 'featured_image') {
        $thumbnail_id = get_post_thumbnail_id($post_id);
        if ($thumbnail_id) {
            echo get_the_post_thumbnail($post_id, array(60, 60), array('style' => 'max-width: 60px; height: auto;'));
        } else {
            echo '<span style="color: #999;">—</span>';
        }
    }
}
add_action('manage_strategy_course_posts_custom_column', 'gaal_populate_featured_image_column_strategy_course', 10, 2);

// Add Featured Image column to Tool admin list table
function gaal_add_featured_image_column_tool($columns) {
    // Insert Featured Image column after Title
    $new_columns = array();
    foreach ($columns as $key => $value) {
        $new_columns[$key] = $value;
        if ($key === 'title') {
            $new_columns['featured_image'] = __('Featured Image', 'kingdom-training');
        }
    }
    // If title column wasn't found, add featured_image at the beginning
    if (!isset($new_columns['featured_image'])) {
        $new_columns = array_merge(array('featured_image' => __('Featured Image', 'kingdom-training')), $columns);
    }
    return $new_columns;
}
add_filter('manage_tool_posts_columns', 'gaal_add_featured_image_column_tool');

// Populate Featured Image column for Tool
function gaal_populate_featured_image_column_tool($column, $post_id) {
    if ($column === 'featured_image') {
        $thumbnail_id = get_post_thumbnail_id($post_id);
        if ($thumbnail_id) {
            echo get_the_post_thumbnail($post_id, array(60, 60), array('style' => 'max-width: 60px; height: auto;'));
        } else {
            echo '<span style="color: #999;">—</span>';
        }
    }
}
add_action('manage_tool_posts_custom_column', 'gaal_populate_featured_image_column_tool', 10, 2);

// Add Featured Image column to Article admin list table
function gaal_add_featured_image_column_article($columns) {
    // Insert Featured Image column after Title
    $new_columns = array();
    foreach ($columns as $key => $value) {
        $new_columns[$key] = $value;
        if ($key === 'title') {
            $new_columns['featured_image'] = __('Featured Image', 'kingdom-training');
        }
    }
    // If title column wasn't found, add featured_image at the beginning
    if (!isset($new_columns['featured_image'])) {
        $new_columns = array_merge(array('featured_image' => __('Featured Image', 'kingdom-training')), $columns);
    }
    return $new_columns;
}
add_filter('manage_article_posts_columns', 'gaal_add_featured_image_column_article');

// Populate Featured Image column for Article
function gaal_populate_featured_image_column_article($column, $post_id) {
    if ($column === 'featured_image') {
        $thumbnail_id = get_post_thumbnail_id($post_id);
        if ($thumbnail_id) {
            echo get_the_post_thumbnail($post_id, array(60, 60), array('style' => 'max-width: 60px; height: auto;'));
        } else {
            echo '<span style="color: #999;">—</span>';
        }
    }
}
add_action('manage_article_posts_custom_column', 'gaal_populate_featured_image_column_article', 10, 2);

// Decode HTML entities in article excerpts and content for admin list table
function gaal_decode_article_excerpt_admin($excerpt, $post) {
    // Only apply in admin area and for article post type
    if (is_admin() && isset($post) && $post->post_type === 'article') {
        // Decode HTML entities
        $excerpt = html_entity_decode($excerpt, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }
    return $excerpt;
}
add_filter('get_the_excerpt', 'gaal_decode_article_excerpt_admin', 10, 2);

// Decode HTML entities when excerpt is displayed in admin
function gaal_decode_article_excerpt_display($excerpt) {
    // Only apply in admin area
    if (!is_admin()) {
        return $excerpt;
    }
    
    // Check if we're on the article list page
    global $typenow;
    if ($typenow === 'article') {
        // Decode HTML entities
        $excerpt = html_entity_decode($excerpt, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }
    
    return $excerpt;
}
add_filter('the_excerpt', 'gaal_decode_article_excerpt_display', 20);

// Disable the theme customizer (not needed for headless)
function gaal_remove_customizer() {
    global $wp_customize;
    if (isset($wp_customize)) {
        remove_action('after_setup_theme', array($wp_customize, 'setup_theme'));
    }
}
add_action('after_setup_theme', 'gaal_remove_customizer', 100);

// Clean up unnecessary WordPress features for headless setup
remove_action('wp_head', 'print_emoji_detection_script', 7);
remove_action('admin_print_scripts', 'print_emoji_detection_script');
remove_action('wp_print_styles', 'print_emoji_styles');
remove_action('admin_print_styles', 'print_emoji_styles');

// Show the WordPress admin bar for logged-in users
// The admin bar will automatically appear for users with appropriate permissions

/**
 * Serve React/Vite static files from theme directory
 * This allows the React frontend to be served directly from WordPress
 * Handles client-side routing for React Router
 */
function kingdom_training_serve_frontend() {
    // CRITICAL: Check for REST API requests FIRST, before any other processing
    // Get the raw REQUEST_URI to check
    $raw_uri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '';
    
    // Multiple checks to ensure we catch REST API requests
    // Check if this looks like a REST API request
    $is_rest_api = false;
    
    // Method 1: Check REQUEST_URI directly
    if (strpos($raw_uri, '/wp-json') !== false) {
        $is_rest_api = true;
    }
    
    // Method 2: Check WordPress REST API constant
    if (defined('REST_REQUEST') && REST_REQUEST) {
        $is_rest_api = true;
    }
    
    // Method 3: Use WordPress's REST API detection function if available
    if (function_exists('rest_is_rest_api_request') && rest_is_rest_api_request()) {
        $is_rest_api = true;
    }
    
    // Method 4: Check using WordPress's URL prefix function
    if (function_exists('rest_get_url_prefix')) {
        $rest_prefix = rest_get_url_prefix();
        if ($rest_prefix && strpos($raw_uri, '/' . $rest_prefix) !== false) {
            $is_rest_api = true;
        }
    }
    
    if ($is_rest_api) {
        // This is a REST API request - exit immediately and let WordPress handle it
        return;
    }
    
    // Now safely parse the URI for frontend serving
    $request_uri_full = $raw_uri;
    $request_uri_path = parse_url($request_uri_full, PHP_URL_PATH);
    
    // Don't interfere with admin, REST API, or AJAX requests
    if (is_admin() || defined('DOING_AJAX') || wp_doing_ajax()) {
        return;
    }

    // Don't interfere with login, registration, etc.
    if (in_array($GLOBALS['pagenow'], array('wp-login.php', 'wp-register.php'))) {
        return;
    }

    $theme_dir = get_template_directory();
    $dist_dir = $theme_dir . '/dist';
    
    // Check if dist directory exists (Vite build output)
    if (!is_dir($dist_dir)) {
        return; // Fall back to default WordPress template
    }

    // Process the request URI - use the path we already extracted
    $request_uri = trim($request_uri_path, '/');
    $home_path = parse_url(home_url(), PHP_URL_PATH);
    if ($home_path && $home_path !== '/') {
        $home_path = trim($home_path, '/');
        if (strpos($request_uri, $home_path) === 0) {
            $request_uri = substr($request_uri, strlen($home_path));
            $request_uri = trim($request_uri, '/');
        }
    }

    // Check if it's a request for files in the dist directory
    // This includes /assets/... files and root-level files like /kt-logo-header.webp
    // Check both the processed URI and the original path
    $has_extension = pathinfo($request_uri, PATHINFO_EXTENSION);
    $original_has_extension = pathinfo($request_uri_path, PATHINFO_EXTENSION);
    
    if ($has_extension || $original_has_extension) {
        // It's a static asset request (JS, CSS, images, etc.)
        // Normalize the path - ensure no double slashes
        $normalized_uri = ltrim($request_uri, '/');
        $normalized_original = ltrim($request_uri_path, '/');
        
        // Try multiple possible paths to find the file
        $possible_paths = array(
            $dist_dir . '/' . $normalized_uri,  // Processed URI
            $dist_dir . '/' . $normalized_original,  // Original path normalized
            $dist_dir . '/' . $request_uri_path,  // Original path as-is
            $dist_dir . '/' . ltrim($request_uri_path, '/'),  // Original path without leading slash
        );
        
        // Also try with the original REQUEST_URI directly (before any parsing)
        if (isset($_SERVER['REQUEST_URI'])) {
            $raw_path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            $raw_normalized = ltrim($raw_path, '/');
            $possible_paths[] = $dist_dir . '/' . $raw_normalized;
            $possible_paths[] = $dist_dir . '/' . $raw_path;
        }
        
        // Remove duplicates and empty paths
        $possible_paths = array_filter(array_unique($possible_paths));
        
        $file_path = null;
        foreach ($possible_paths as $path) {
            // Normalize path separators
            $path = str_replace('\\', '/', $path);
            if (file_exists($path) && is_file($path)) {
                $file_path = $path;
                break;
            }
        }
        
        if ($file_path) {
            // Set proper content type based on file extension
            // Use whichever extension was found
            $extension = strtolower($has_extension ? $has_extension : $original_has_extension);
            $mime_types = array(
                'js' => 'application/javascript',
                'css' => 'text/css',
                'json' => 'application/json',
                'png' => 'image/png',
                'jpg' => 'image/jpeg',
                'jpeg' => 'image/jpeg',
                'gif' => 'image/gif',
                'svg' => 'image/svg+xml',
                'webp' => 'image/webp',
                'woff' => 'font/woff',
                'woff2' => 'font/woff2',
                'ttf' => 'font/ttf',
                'eot' => 'application/vnd.ms-fontobject',
            );
            
            $mime_type = isset($mime_types[$extension]) 
                ? $mime_types[$extension] 
                : mime_content_type($file_path);
            
            if ($mime_type) {
                header('Content-Type: ' . $mime_type);
            }
            
            // Enhanced cache headers for static assets (1 year cache)
            // Use immutable for versioned assets (files with hash in name like main-abc123.js)
            $is_versioned = preg_match('/[a-f0-9]{8,}/i', basename($file_path));
            $cache_directive = $is_versioned 
                ? 'public, max-age=31536000, immutable' 
                : 'public, max-age=31536000';
            
            header('Cache-Control: ' . $cache_directive);
            header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 31536000) . ' GMT');
            
            // Add ETag for cache validation (based on file modification time and size)
            $filemtime = filemtime($file_path);
            $filesize = filesize($file_path);
            $etag = md5($file_path . $filemtime . $filesize);
            header('ETag: "' . $etag . '"');
            header('Last-Modified: ' . gmdate('D, d M Y H:i:s', $filemtime) . ' GMT');
            
            // Handle conditional requests (304 Not Modified)
            if (isset($_SERVER['HTTP_IF_NONE_MATCH']) && $_SERVER['HTTP_IF_NONE_MATCH'] === '"' . $etag . '"') {
                header('HTTP/1.1 304 Not Modified');
                exit;
            }
            if (isset($_SERVER['HTTP_IF_MODIFIED_SINCE'])) {
                $if_modified_since = strtotime($_SERVER['HTTP_IF_MODIFIED_SINCE']);
                if ($if_modified_since >= $filemtime) {
                    header('HTTP/1.1 304 Not Modified');
                    exit;
                }
            }
            
            readfile($file_path);
            exit;
        }
    }
    
    // It's a route - serve index.html for client-side routing
    // React Router will handle the routing on the client side
    $file_path = $dist_dir . '/index.html';
    if (file_exists($file_path) && is_file($file_path)) {
        // Add performance headers
        header('Content-Type: text/html; charset=UTF-8');
        header('X-Content-Type-Options: nosniff');
        
        // Cache HTML for shorter duration (5 minutes) since it may change
        // But still cacheable to improve repeat visit performance
        header('Cache-Control: public, max-age=300, must-revalidate');
        header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 300) . ' GMT');
        
        // Add ETag for HTML file
        $filemtime = filemtime($file_path);
        $filesize = filesize($file_path);
        $etag = md5($file_path . $filemtime . $filesize);
        header('ETag: "' . $etag . '"');
        header('Last-Modified: ' . gmdate('D, d M Y H:i:s', $filemtime) . ' GMT');
        
        // Handle conditional requests (304 Not Modified)
        if (isset($_SERVER['HTTP_IF_NONE_MATCH']) && $_SERVER['HTTP_IF_NONE_MATCH'] === '"' . $etag . '"') {
            header('HTTP/1.1 304 Not Modified');
            exit;
        }
        if (isset($_SERVER['HTTP_IF_MODIFIED_SINCE'])) {
            $if_modified_since = strtotime($_SERVER['HTTP_IF_MODIFIED_SINCE']);
            if ($if_modified_since >= $filemtime) {
                header('HTTP/1.1 304 Not Modified');
                exit;
            }
        }
        
        // Enable compression if not already handled by server
        if (!headers_sent() && extension_loaded('zlib') && !ini_get('zlib.output_compression')) {
            if (strpos($_SERVER['HTTP_ACCEPT_ENCODING'] ?? '', 'gzip') !== false) {
                ob_start('ob_gzhandler');
            }
        }
        
        $content = file_get_contents($file_path);
        
        // Get theme URI for asset paths
        $theme_uri = get_template_directory_uri() . '/dist';
        
        // Replace absolute asset paths with theme-relative paths FIRST
        // Handle href="/assets/..." and src="/assets/..." (most common case)
        $content = preg_replace('/(href|src)=["\']\/(assets\/[^"\']+)["\']/', '$1="' . $theme_uri . '/$2"', $content);
        
        // Handle other files in dist directory (like /kt-logo-header.webp, /vite.svg, /robots.txt, etc.)
        // Only replace if the file exists in the dist directory
        $content = preg_replace_callback(
            '/(href|src)=["\']\/([^"\']+\.[a-zA-Z0-9]+)["\']/',
            function($matches) use ($dist_dir, $theme_uri) {
                // Skip assets/ paths as they're already handled above
                if (strpos($matches[2], 'assets/') === 0) {
                    return $matches[0];
                }
                
                $file_path = $dist_dir . '/' . $matches[2];
                // Only replace if file exists in dist directory and is not a WordPress path
                if (file_exists($file_path) && strpos($matches[2], 'wp-') !== 0 && strpos($matches[2], 'wp/') !== 0) {
                    return $matches[1] . '="' . $theme_uri . '/' . $matches[2] . '"';
                }
                return $matches[0]; // Keep original if file doesn't exist or is a WordPress path
            },
            $content
        );
        
        // Add preload hints for critical resources AFTER path replacement (improves FCP/LCP)
        $preload_hints = '';
        
        // Preload the main CSS file (critical for rendering) - now using already-replaced paths
        if (preg_match('/href="([^"]*main[^"]*\.css)"/', $content, $css_match)) {
            // The path is already replaced, so use it directly
            $preload_hints .= '<link rel="preload" href="' . esc_attr($css_match[1]) . '" as="style">' . "\n    ";
        }
        
        // Preload Google Fonts connection
        $preload_hints .= '<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>' . "\n    ";
        $preload_hints .= '<link rel="dns-prefetch" href="https://fonts.googleapis.com">' . "\n    ";
        
        // Preload WordPress API connection
        $preload_hints .= '<link rel="preconnect" href="' . esc_url(home_url()) . '">' . "\n    ";
        
        // Insert preload hints after charset meta tag
        $content = str_replace('<meta charset="UTF-8" />', '<meta charset="UTF-8" />' . "\n    " . $preload_hints, $content);
        $content = str_replace('<meta charset="UTF-8">', '<meta charset="UTF-8">' . "\n    " . $preload_hints, $content);
        
        echo $content;
        exit;
    }
}
// Hook early to catch REST API requests before they're processed
// Use a high priority to run before other template_redirect hooks
add_action('template_redirect', 'kingdom_training_serve_frontend', 1);

// ============================================================================
// TRANSLATION SYSTEM FOR FRONTEND UI STRINGS
// ============================================================================

/**
 * Register all UI strings for translation with Polylang
 * These strings are used in the React frontend and can be translated
 * via WordPress Admin > Languages > String translations
 */
function gaal_register_ui_strings() {
    if (!function_exists('pll_register_string')) {
        return; // Polylang not active
    }

    // Navigation Menu Strings
    pll_register_string('nav_home', 'Home', 'Frontend UI');
    pll_register_string('nav_articles', 'Articles', 'Frontend UI');
    pll_register_string('nav_tools', 'Tools', 'Frontend UI');
    pll_register_string('nav_strategy_course', 'Strategy Course', 'Frontend UI');
    pll_register_string('nav_strategy_courses', 'Strategy Courses', 'Frontend UI');
    pll_register_string('nav_newsletter', 'Newsletter', 'Frontend UI');
    pll_register_string('nav_search', 'Search', 'Frontend UI');
    pll_register_string('nav_login', 'Login', 'Frontend UI');
    pll_register_string('nav_menu', 'Menu', 'Frontend UI');
    pll_register_string('nav_about', 'About', 'Frontend UI');

    // Common UI Strings
    pll_register_string('ui_read_more', 'Learn more', 'Frontend UI');
    pll_register_string('ui_view_all', 'View all', 'Frontend UI');
    pll_register_string('ui_browse_all', 'Browse all', 'Frontend UI');
    pll_register_string('ui_back_to', 'Back to', 'Frontend UI');
    pll_register_string('ui_explore', 'Explore', 'Frontend UI');
    pll_register_string('ui_read_articles', 'Read Articles', 'Frontend UI');
    pll_register_string('ui_explore_tools', 'Explore Tools', 'Frontend UI');
    pll_register_string('ui_select_language', 'Select Language', 'Frontend UI');
    pll_register_string('ui_close', 'Close', 'Frontend UI');
    pll_register_string('ui_loading', 'Loading...', 'Frontend UI');

    // Page Headers and Titles
    pll_register_string('page_latest_articles', 'Latest Articles', 'Frontend UI');
    pll_register_string('page_featured_tools', 'Featured Tools', 'Frontend UI');
    pll_register_string('page_key_information', 'Key Information About Media to Disciple Making Movements', 'Frontend UI');
    pll_register_string('page_mvp_strategy_course', 'The MVP: Strategy Course', 'Frontend UI');
    pll_register_string('page_start_strategy_course', 'Start Your Strategy Course', 'Frontend UI');
    pll_register_string('page_step_curriculum', 'The {count}-Step Curriculum:', 'Frontend UI');

    // Content Messages
    pll_register_string('msg_no_articles', 'Articles will appear here once content is added to WordPress.', 'Frontend UI');
    pll_register_string('msg_no_tools', 'Tools will appear here once content is added to WordPress.', 'Frontend UI');
    pll_register_string('msg_no_content', 'No content found.', 'Frontend UI');
    pll_register_string('msg_discover_supplementary', 'Discover supplementary tools and resources to enhance your M2DMM strategy development and practice.', 'Frontend UI');
    pll_register_string('msg_discover_more', 'Discover more articles and resources to deepen your understanding and enhance your M2DMM practice.', 'Frontend UI');

    // Footer Strings
    pll_register_string('footer_quick_links', 'Quick Links', 'Frontend UI');
    pll_register_string('footer_our_vision', 'Our Vision', 'Frontend UI');
    pll_register_string('footer_subscribe', 'Subscribe to Newsletter', 'Frontend UI');
    pll_register_string('footer_privacy_policy', 'Privacy Policy', 'Frontend UI');
    pll_register_string('footer_all_rights', 'All rights reserved.', 'Frontend UI');
    pll_register_string('footer_mission_statement', 'Training disciple makers to use media to accelerate Disciple Making Movements. Equipping practitioners with practical strategies that bridge online engagement with face-to-face discipleship.', 'Frontend UI');
    pll_register_string('footer_scripture_quote', 'Of the sons of Issachar, men who understood the times, with knowledge of what Israel should do.', 'Frontend UI');
    pll_register_string('footer_scripture_citation', '— 1 Chronicles 12:32', 'Frontend UI');
    pll_register_string('footer_technology_paragraph', 'We wonder what the Church could accomplish with technology God has given to this generation for the first time in history.', 'Frontend UI');

    // Newsletter Strings
    pll_register_string('newsletter_subscribe', 'Subscribe', 'Frontend UI');
    pll_register_string('newsletter_email_placeholder', 'Enter your email', 'Frontend UI');
    pll_register_string('newsletter_name_placeholder', 'Enter your name', 'Frontend UI');
    pll_register_string('newsletter_success', 'Successfully subscribed!', 'Frontend UI');
    pll_register_string('newsletter_error', 'Failed to subscribe. Please try again.', 'Frontend UI');

    // Search Strings
    pll_register_string('search_placeholder', 'Search...', 'Frontend UI');
    pll_register_string('search_no_results', 'No results found', 'Frontend UI');
    pll_register_string('search_results', 'Search Results', 'Frontend UI');

    // Breadcrumb Strings
    pll_register_string('breadcrumb_home', 'Home', 'Frontend UI');
    pll_register_string('breadcrumb_articles', 'Articles', 'Frontend UI');
    pll_register_string('breadcrumb_tools', 'Tools', 'Frontend UI');
    pll_register_string('breadcrumb_strategy_courses', 'Strategy Courses', 'Frontend UI');

    // Hero Section Strings
    pll_register_string('hero_explore_resources', 'Explore Our Resources', 'Frontend UI');
    pll_register_string('hero_about_us', 'About Us', 'Frontend UI');
    pll_register_string('hero_description', 'Accelerate your disciple making with strategic use of media, advertising, and AI tools. Kingdom.Training is a resource for disciple makers to use media to accelerate Disciple Making Movements.', 'Frontend UI', true);

    // Homepage Content Strings (longer text chunks)
    pll_register_string('home_mvp_description', 'Our flagship course guides you through 10 core elements needed to craft a Media to Disciple Making Movements strategy for any context. Complete your plan in 6-7 hours.', 'Frontend UI', true);
    pll_register_string('home_newsletter_description', 'Field driven tools and articles for disciple makers.', 'Frontend UI');
    pll_register_string('home_heavenly_economy', 'We operate within what we call the "Heavenly Economy"—a principle that challenges the broken world\'s teaching that "the more you get, the more you should keep." Instead, we reflect God\'s generous nature by offering free training, hands-on coaching, and open-source tools like Disciple.Tools.', 'Frontend UI', true);
    pll_register_string('home_mission_statement', 'Our heart beats with passion for the unreached and least-reached peoples of the world. Every course, article, and tool serves the ultimate vision of seeing Disciple Making Movements catalyzed among people groups where the name of Jesus has never been proclaimed.', 'Frontend UI', true);
    pll_register_string('home_loading_steps', 'Loading course steps...', 'Frontend UI');
}
add_action('init', 'gaal_register_ui_strings');

/**
 * REST API endpoint for frontend translations
 * Returns all registered UI strings translated to the specified language
 * 
 * Usage: GET /wp-json/gaal/v1/translations?lang=en
 */
function gaal_register_translations_api() {
    register_rest_route('gaal/v1', '/translations', array(
        'methods' => 'GET',
        'callback' => function($request) {
            if (!function_exists('pll_translate_string')) {
                return new WP_Error('polylang_not_active', 'Polylang is not active', array('status' => 500));
            }

            $lang = $request->get_param('lang');
            
            // If no language specified, try to get current language
            if (empty($lang) && function_exists('pll_current_language')) {
                $lang = pll_current_language('slug');
            }
            
            // If still no language, get default
            if (empty($lang) && function_exists('pll_default_language')) {
                $lang = pll_default_language('slug');
            }

            // Fallback to 'en' if still no language
            if (empty($lang)) {
                $lang = 'en';
            }

            // Get all registered strings and their translations
            // Note: pll_translate_string requires the original English string
            $strings = array(
                // Navigation
                'nav_home' => pll_translate_string('Home', $lang),
                'nav_articles' => pll_translate_string('Articles', $lang),
                'nav_tools' => pll_translate_string('Tools', $lang),
                'nav_strategy_course' => pll_translate_string('Strategy Course', $lang),
                'nav_strategy_courses' => pll_translate_string('Strategy Courses', $lang),
                'nav_newsletter' => pll_translate_string('Newsletter', $lang),
                'nav_search' => pll_translate_string('Search', $lang),
                'nav_login' => pll_translate_string('Login', $lang),
                'nav_menu' => pll_translate_string('Menu', $lang),
                'nav_about' => pll_translate_string('About', $lang),

                // Common UI
                'ui_read_more' => pll_translate_string('Learn more', $lang),
                'ui_view_all' => pll_translate_string('View all', $lang),
                'ui_browse_all' => pll_translate_string('Browse all', $lang),
                'ui_back_to' => pll_translate_string('Back to', $lang),
                'ui_explore' => pll_translate_string('Explore', $lang),
                'ui_read_articles' => pll_translate_string('Read Articles', $lang),
                'ui_explore_tools' => pll_translate_string('Explore Tools', $lang),
                'ui_select_language' => pll_translate_string('Select Language', $lang),
                'ui_close' => pll_translate_string('Close', $lang),
                'ui_loading' => pll_translate_string('Loading...', $lang),

                // Page Headers
                'page_latest_articles' => pll_translate_string('Latest Articles', $lang),
                'page_featured_tools' => pll_translate_string('Featured Tools', $lang),
                'page_key_information' => pll_translate_string('Key Information About Media to Disciple Making Movements', $lang),
                'page_mvp_strategy_course' => pll_translate_string('The MVP: Strategy Course', $lang),
                'page_start_strategy_course' => pll_translate_string('Start Your Strategy Course', $lang),
                'page_step_curriculum' => pll_translate_string('The {count}-Step Curriculum:', $lang),

                // Content Messages
                'msg_no_articles' => pll_translate_string('Articles will appear here once content is added to WordPress.', $lang),
                'msg_no_tools' => pll_translate_string('Tools will appear here once content is added to WordPress.', $lang),
                'msg_no_content' => pll_translate_string('No content found.', $lang),
                'msg_discover_supplementary' => pll_translate_string('Discover supplementary tools and resources to enhance your M2DMM strategy development and practice.', $lang),
                'msg_discover_more' => pll_translate_string('Discover more articles and resources to deepen your understanding and enhance your M2DMM practice.', $lang),

                // Footer
                'footer_quick_links' => pll_translate_string('Quick Links', $lang),
                'footer_our_vision' => pll_translate_string('Our Vision', $lang),
                'footer_subscribe' => pll_translate_string('Subscribe to Newsletter', $lang),
                'footer_privacy_policy' => pll_translate_string('Privacy Policy', $lang),
                'footer_all_rights' => pll_translate_string('All rights reserved.', $lang),
                'footer_mission_statement' => pll_translate_string('Training disciple makers to use media to accelerate Disciple Making Movements. Equipping practitioners with practical strategies that bridge online engagement with face-to-face discipleship.', $lang),
                'footer_scripture_quote' => pll_translate_string('Of the sons of Issachar, men who understood the times, with knowledge of what Israel should do.', $lang),
                'footer_scripture_citation' => pll_translate_string('— 1 Chronicles 12:32', $lang),
                'footer_technology_paragraph' => pll_translate_string('We wonder what the Church could accomplish with technology God has given to this generation for the first time in history.', $lang),

                // Newsletter
                'newsletter_subscribe' => pll_translate_string('Subscribe', $lang),
                'newsletter_email_placeholder' => pll_translate_string('Enter your email', $lang),
                'newsletter_name_placeholder' => pll_translate_string('Enter your name', $lang),
                'newsletter_success' => pll_translate_string('Successfully subscribed!', $lang),
                'newsletter_error' => pll_translate_string('Failed to subscribe. Please try again.', $lang),

                // Search
                'search_placeholder' => pll_translate_string('Search...', $lang),
                'search_no_results' => pll_translate_string('No results found', $lang),
                'search_results' => pll_translate_string('Search Results', $lang),

                // Breadcrumbs
                'breadcrumb_home' => pll_translate_string('Home', $lang),
                'breadcrumb_articles' => pll_translate_string('Articles', $lang),
                'breadcrumb_tools' => pll_translate_string('Tools', $lang),
                'breadcrumb_strategy_courses' => pll_translate_string('Strategy Courses', $lang),

                // Hero
                'hero_explore_resources' => pll_translate_string('Explore Our Resources', $lang),
                'hero_about_us' => pll_translate_string('About Us', $lang),
                'hero_description' => pll_translate_string('Accelerate your disciple making with strategic use of media, advertising, and AI tools. Kingdom.Training is a resource for disciple makers to use media to accelerate Disciple Making Movements.', $lang),

                // Homepage Content (longer text chunks)
                'home_mvp_description' => pll_translate_string('Our flagship course guides you through 10 core elements needed to craft a Media to Disciple Making Movements strategy for any context. Complete your plan in 6-7 hours.', $lang),
                'home_newsletter_description' => pll_translate_string('Field driven tools and articles for disciple makers.', $lang),
                'home_heavenly_economy' => pll_translate_string('We operate within what we call the "Heavenly Economy"—a principle that challenges the broken world\'s teaching that "the more you get, the more you should keep." Instead, we reflect God\'s generous nature by offering free training, hands-on coaching, and open-source tools like Disciple.Tools.', $lang),
                'home_mission_statement' => pll_translate_string('Our heart beats with passion for the unreached and least-reached peoples of the world. Every course, article, and tool serves the ultimate vision of seeing Disciple Making Movements catalyzed among people groups where the name of Jesus has never been proclaimed.', $lang),
                'home_loading_steps' => pll_translate_string('Loading course steps...', $lang),
            );

            return array(
                'success' => true,
                'language' => $lang,
                'translations' => $strings,
            );
        },
        'permission_callback' => '__return_true',
    ));
}
add_action('rest_api_init', 'gaal_register_translations_api');

// ============================================================================
// TRANSLATION AUTOMATION REST API ENDPOINTS
// ============================================================================

/**
 * Register translation automation REST API endpoints
 */
function gaal_register_translation_api() {
    // Generate all translations endpoint
    register_rest_route('gaal/v1', '/translate/generate-all', array(
        'methods' => 'POST',
        'callback' => 'gaal_api_generate_all_translations',
        'permission_callback' => 'gaal_check_translation_permissions',
        'args' => array(
            'post_id' => array(
                'required' => true,
                'type' => 'integer',
                'validate_callback' => function($param) {
                    return is_numeric($param) && $param > 0;
                },
                'sanitize_callback' => 'absint',
            ),
        ),
    ));
    
    // Simple test endpoint - always returns success
    register_rest_route('gaal/v1', '/translate/test', array(
        'methods' => array('GET', 'POST'),
        'callback' => function($request) {
            return new WP_REST_Response(array(
                'success' => true,
                'message' => 'Test endpoint working',
                'method' => $request->get_method(),
                'params' => $request->get_params(),
                'body_params' => $request->get_body_params(),
                'json_params' => $request->get_json_params(),
                'body' => $request->get_body(),
            ), 200);
        },
        'permission_callback' => '__return_true', // No auth required for testing
    ));
    
    // Test Google Translate API configuration (public for debugging)
    register_rest_route('gaal/v1', '/translate/test-google', array(
        'methods' => 'GET',
        'callback' => function($request) {
            $google_api_key = get_option('gaal_translation_google_api_key', '');
            
            if (empty($google_api_key)) {
                return new WP_REST_Response(array(
                    'success' => false,
                    'error' => 'Google Translate API key is not configured',
                    'api_key_status' => 'empty',
                    'hint' => 'Set the API key in WordPress Admin > Settings > Translation Automation',
                ), 200);
            }
            
            // Test the API
            try {
                $google_translate = new GAAL_Google_Translate_API($google_api_key);
                $result = $google_translate->test_connection();
                
                if (is_wp_error($result)) {
                    return new WP_REST_Response(array(
                        'success' => false,
                        'error' => $result->get_error_message(),
                        'error_code' => $result->get_error_code(),
                        'error_data' => $result->get_error_data(),
                        'api_key_preview' => substr($google_api_key, 0, 8) . '...',
                        'api_key_length' => strlen($google_api_key),
                    ), 200);
                }
                
                return new WP_REST_Response(array(
                    'success' => true,
                    'message' => 'Google Translate API is working',
                    'test_result' => $result,
                ), 200);
            } catch (Exception $e) {
                return new WP_REST_Response(array(
                    'success' => false,
                    'error' => 'Exception: ' . $e->getMessage(),
                    'api_key_preview' => substr($google_api_key, 0, 8) . '...',
                ), 200);
            }
        },
        'permission_callback' => '__return_true', // Public for debugging
    ));
    
    // Translate single language endpoint
    register_rest_route('gaal/v1', '/translate/single', array(
        'methods' => 'POST',
        'callback' => 'gaal_api_translate_single',
        'permission_callback' => function() {
            return current_user_can('edit_posts');
        },
    ));
    
    // Re-translate endpoint
    register_rest_route('gaal/v1', '/translate/retranslate', array(
        'methods' => 'POST',
        'callback' => 'gaal_api_retranslate',
        'permission_callback' => 'gaal_check_translation_permissions',
        'args' => array(
            'post_id' => array(
                'required' => true,
                'type' => 'integer',
                'validate_callback' => function($param) {
                    return is_numeric($param) && $param > 0;
                },
                'sanitize_callback' => 'absint',
            ),
            'target_language' => array(
                'required' => false,
                'type' => 'string',
                'sanitize_callback' => 'sanitize_text_field',
            ),
        ),
    ));
    
    // Get translation status endpoint
    register_rest_route('gaal/v1', '/translate/status/(?P<post_id>\d+)', array(
        'methods' => 'GET',
        'callback' => 'gaal_api_get_translation_status',
        'permission_callback' => 'gaal_check_translation_permissions',
        'args' => array(
            'post_id' => array(
                'required' => true,
                'validate_callback' => function($param) {
                    return is_numeric($param);
                },
            ),
        ),
    ));
    
    // Resume job endpoint
    register_rest_route('gaal/v1', '/translate/resume', array(
        'methods' => 'POST',
        'callback' => 'gaal_api_resume_job',
        'permission_callback' => 'gaal_check_translation_permissions',
    ));
    
    // Copy content from English endpoint
    register_rest_route('gaal/v1', '/translate/copy-from-english', array(
        'methods' => 'POST',
        'callback' => 'gaal_api_copy_from_english',
        'permission_callback' => function() {
            return current_user_can('edit_posts');
        },
        'args' => array(
            'target_post_id' => array(
                'required' => true,
                'type' => 'integer',
                'validate_callback' => function($param) {
                    return is_numeric($param) && $param > 0;
                },
                'sanitize_callback' => 'absint',
            ),
            'source_post_id' => array(
                'required' => true,
                'type' => 'integer',
                'validate_callback' => function($param) {
                    return is_numeric($param) && $param > 0;
                },
                'sanitize_callback' => 'absint',
            ),
        ),
    ));
    
    // Chunked translation endpoint - handles translation in steps to avoid timeout
    register_rest_route('gaal/v1', '/translate/chunked', array(
        'methods' => 'POST',
        'callback' => 'gaal_api_translate_chunked',
        'permission_callback' => function() {
            return current_user_can('edit_posts');
        },
        'args' => array(
            'source_post_id' => array(
                'required' => true,
                'type' => 'integer',
                'validate_callback' => function($param) {
                    return is_numeric($param) && $param > 0;
                },
                'sanitize_callback' => 'absint',
            ),
            'target_language' => array(
                'required' => true,
                'type' => 'string',
                'sanitize_callback' => 'sanitize_text_field',
            ),
            'step' => array(
                'required' => true,
                'type' => 'string',
                'sanitize_callback' => 'sanitize_text_field',
            ),
            'job_id' => array(
                'required' => false,
                'type' => 'integer',
                'sanitize_callback' => 'absint',
            ),
            'target_post_id' => array(
                'required' => false,
                'type' => 'integer',
                'sanitize_callback' => 'absint',
            ),
        ),
    ));
    
    // =========================================================================
    // AUTO TRANSLATE DASHBOARD ENDPOINTS
    // =========================================================================
    
    // Scan for translation gaps
    register_rest_route('gaal/v1', '/translate/scan', array(
        'methods' => 'GET',
        'callback' => 'gaal_api_scan_translation_gaps',
        'permission_callback' => function() {
            return current_user_can('manage_options');
        },
        'args' => array(
            'post_type' => array(
                'type' => 'string',
                'default' => '',
                'sanitize_callback' => 'sanitize_text_field',
            ),
            'language' => array(
                'type' => 'string',
                'default' => '',
                'sanitize_callback' => 'sanitize_text_field',
            ),
        ),
    ));
    
    // Create draft translations
    register_rest_route('gaal/v1', '/translate/create-drafts', array(
        'methods' => 'POST',
        'callback' => 'gaal_api_create_translation_drafts',
        'permission_callback' => function() {
            return current_user_can('manage_options');
        },
    ));
}

/**
 * Scan for translation gaps
 * 
 * @param WP_REST_Request $request Request object
 * @return WP_REST_Response
 */
function gaal_api_scan_translation_gaps($request) {
    $scanner = new GAAL_Translation_Scanner();
    
    $filters = array();
    if ($request->get_param('post_type')) {
        $filters['post_type'] = $request->get_param('post_type');
    }
    if ($request->get_param('language')) {
        $filters['language'] = $request->get_param('language');
    }
    
    return rest_ensure_response(array(
        'success' => true,
        'gaps' => $scanner->find_gaps($filters),
        'summary' => $scanner->get_summary(),
    ));
}

/**
 * Create draft translations
 * 
 * @param WP_REST_Request $request Request object
 * @return WP_REST_Response|WP_Error
 */
function gaal_api_create_translation_drafts($request) {
    $items = $request->get_param('items');
    
    if (empty($items)) {
        return new WP_Error('no_items', __('No items provided', 'kingdom-training'), array('status' => 400));
    }
    
    $batch_translator = new GAAL_Batch_Translator();
    $results = $batch_translator->create_drafts($items);
    
    // Count results
    $created = 0;
    $existed = 0;
    $errors = 0;
    
    foreach ($results as $post_results) {
        if (isset($post_results['error'])) {
            $errors++;
            continue;
        }
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
    
    return rest_ensure_response(array(
        'success' => true,
        'results' => $results,
        'summary' => array(
            'created' => $created,
            'existed' => $existed,
            'errors' => $errors,
        ),
    ));
}
add_action('rest_api_init', 'gaal_register_translation_api');

/**
 * Check if user has permission to use translation features
 * 
 * @param WP_REST_Request $request Request object
 * @return bool|WP_Error
 */
function gaal_check_translation_permissions($request) {
    // Temporarily allow all requests for debugging
    return true;
    
    // Original permission checks (commented out for debugging):
    /*
    // Check if user is logged in
    if (!is_user_logged_in()) {
        return new WP_Error('rest_forbidden', __('You must be logged in to use this endpoint.', 'kingdom-training'), array('status' => 401));
    }
    
    // Check user capability
    if (!current_user_can('edit_posts')) {
        return new WP_Error('rest_forbidden', __('You do not have permission to use translation features.', 'kingdom-training'), array('status' => 403));
    }
    
    return true;
    */
}

/**
 * Generate all translations for a post
 * 
 * @param WP_REST_Request $request Request object
 * @return WP_REST_Response|WP_Error
 */
function gaal_api_generate_all_translations($request) {
    // Get parameters from request body (JSON) or query string
    $post_id = $request->get_param('post_id');
    
    // Log for debugging
    GAAL_Translation_Logger::debug('Generate all translations request', array(
        'post_id' => $post_id,
        'method' => $request->get_method(),
        'headers' => $request->get_headers(),
        'body' => $request->get_body(),
        'json_params' => $request->get_json_params(),
    ));
    
    if (empty($post_id)) {
        GAAL_Translation_Logger::error('Missing post_id in translation request');
        return new WP_Error('missing_post_id', __('Post ID is required', 'kingdom-training'), array('status' => 400));
    }
    
    // Verify post exists
    $post = get_post($post_id);
    if (!$post) {
        return new WP_Error('post_not_found', __('Post not found', 'kingdom-training'), array('status' => 404));
    }
    
    // Get enabled languages
    $enabled_languages = get_option('gaal_translation_enabled_languages', array());
    if (empty($enabled_languages)) {
        return new WP_Error('no_languages', __('No languages enabled for translation', 'kingdom-training'), array('status' => 400));
    }
    
    // Check if Google Translate API is configured
    $google_api_key = get_option('gaal_translation_google_api_key', '');
    if (empty($google_api_key)) {
        GAAL_Translation_Logger::error('Google Translate API key not configured');
        return new WP_Error(
            'api_not_configured',
            __('Google Translate API key is not configured. Please configure it in Translation Settings.', 'kingdom-training'),
            array('status' => 400)
        );
    }
    
    // Create translation job
    $job = new GAAL_Translation_Job();
    $job_id = GAAL_Translation_Job::create($post_id, $enabled_languages);
    
    if (is_wp_error($job_id)) {
        return $job_id;
    }
    
    $job = new GAAL_Translation_Job($job_id);
    $job->set_status(GAAL_Translation_Job::STATUS_IN_PROGRESS);
    
    // Start background processing
    $engine = new GAAL_Translation_Engine();
    $result = $engine->translate_all_languages($post_id, $job);
    
    if (is_wp_error($result)) {
        $error_data = $result->get_error_data();
        $error_message = $result->get_error_message();
        
        // Include detailed error information if available
        if (isset($error_data['errors']) && is_array($error_data['errors'])) {
            $error_message .= ': ' . implode(', ', $error_data['errors']);
        }
        
        GAAL_Translation_Logger::error('Translation job failed', array(
            'post_id' => $post_id,
            'error_code' => $result->get_error_code(),
            'error_message' => $error_message,
            'error_data' => $error_data,
        ));
        
        $job->fail($error_message);
        
        return new WP_Error(
            $result->get_error_code(),
            $error_message,
            array('status' => 500, 'errors' => isset($error_data['errors']) ? $error_data['errors'] : array())
        );
    }
    
    // Check if there were any errors in the result
    if (isset($result['errors']) && !empty($result['errors']) && empty($result['translations'])) {
        $error_message = __('All translations failed', 'kingdom-training');
        if (is_array($result['errors'])) {
            $error_message .= ': ' . implode(', ', array_values($result['errors']));
        }
        
        GAAL_Translation_Logger::error('All translations failed', array(
            'post_id' => $post_id,
            'errors' => $result['errors'],
        ));
        
        $job->fail($error_message);
        
        return new WP_Error(
            'translation_failed',
            $error_message,
            array('status' => 500, 'errors' => $result['errors'])
        );
    }
    
    return new WP_REST_Response(array(
        'success' => true,
        'job_id' => $job_id,
        'message' => __('Translation job completed', 'kingdom-training'),
        'result' => $result,
    ), 200);
}

/**
 * Translate to a single language
 * 
 * @param WP_REST_Request $request Request object
 * @return WP_REST_Response|WP_Error
 */
function gaal_api_translate_single($request) {
    // DEBUG STEP 1
    return new WP_REST_Response(array('debug' => 'step1', 'success' => true), 200);
    
    // Get parameters
    $post_id = $request->get_param('post_id');
    $target_language = $request->get_param('target_language');
    
    // DEBUG STEP 2
    // return new WP_REST_Response(array('debug' => 'step2', 'post_id' => $post_id, 'lang' => $target_language, 'success' => true), 200);
    
    // Sanitize
    $post_id = absint($post_id);
    $target_language = sanitize_text_field($target_language);
    
    // Validate
    if (empty($post_id)) {
        return new WP_Error('missing_post_id', 'Post ID is required', array('status' => 400));
    }
    
    if (empty($target_language)) {
        return new WP_Error('missing_target_language', 'Target language is required', array('status' => 400));
    }
    
    // DEBUG STEP 3
    // return new WP_REST_Response(array('debug' => 'step3', 'post_id' => $post_id, 'lang' => $target_language, 'success' => true), 200);
    
    // Verify post exists
    $post = get_post($post_id);
    if (!$post) {
        return new WP_Error('post_not_found', 'Post not found', array('status' => 404));
    }
    
    // DEBUG STEP 4
    // return new WP_REST_Response(array('debug' => 'step4', 'post_title' => $post->post_title, 'success' => true), 200);
    
    // Perform translation
    try {
        // DEBUG STEP 5
        // return new WP_REST_Response(array('debug' => 'step5', 'about_to_create_engine' => true, 'success' => true), 200);
        
        $engine = new GAAL_Translation_Engine();
        
        // DEBUG STEP 6
        // return new WP_REST_Response(array('debug' => 'step6', 'engine_created' => true, 'success' => true), 200);
        
        $translated_post_id = $engine->translate_post($post_id, $target_language);
        
        if (is_wp_error($translated_post_id)) {
            return $translated_post_id;
        }
        
        return new WP_REST_Response(array(
            'success' => true,
            'translated_post_id' => $translated_post_id,
            'target_language' => $target_language,
            'message' => 'Translation completed',
        ), 200);
        
    } catch (Exception $e) {
        return new WP_Error('translation_error', $e->getMessage(), array('status' => 500));
    } catch (Error $e) {
        // Catch PHP 7+ fatal errors
        return new WP_Error('fatal_error', 'Fatal error: ' . $e->getMessage(), array('status' => 500));
    }
}

/**
 * Copy content from English source post to target post
 * 
 * @param WP_REST_Request $request Request object
 * @return WP_REST_Response|WP_Error
 */
function gaal_api_copy_from_english($request) {
    $target_post_id = $request->get_param('target_post_id');
    $source_post_id = $request->get_param('source_post_id');
    
    // Validate target post
    $target_post = get_post($target_post_id);
    if (!$target_post) {
        return new WP_Error('target_not_found', __('Target post not found', 'kingdom-training'), array('status' => 404));
    }
    
    // Validate source post
    $source_post = get_post($source_post_id);
    if (!$source_post) {
        return new WP_Error('source_not_found', __('English source post not found', 'kingdom-training'), array('status' => 404));
    }
    
    // Verify source post is English
    if (function_exists('pll_get_post_language')) {
        $source_language = pll_get_post_language($source_post_id, 'slug');
        if ($source_language !== 'en') {
            return new WP_Error('not_english', __('Source post is not in English', 'kingdom-training'), array('status' => 400));
        }
    }
    
    // Verify posts are linked translations
    if (function_exists('pll_get_post_translations')) {
        $translations = pll_get_post_translations($source_post_id);
        $target_language = function_exists('pll_get_post_language') ? pll_get_post_language($target_post_id, 'slug') : null;
        
        if (!$target_language || !isset($translations[$target_language]) || $translations[$target_language] != $target_post_id) {
            return new WP_Error('not_linked', __('Posts are not linked as translations', 'kingdom-training'), array('status' => 400));
        }
    }
    
    // Copy content from source to target
    $update_data = array(
        'ID' => $target_post_id,
        'post_title' => $source_post->post_title,
        'post_content' => $source_post->post_content,
        'post_excerpt' => $source_post->post_excerpt,
    );
    
    $result = wp_update_post($update_data, true);
    
    if (is_wp_error($result)) {
        return new WP_Error('update_failed', $result->get_error_message(), array('status' => 500));
    }
    
    return new WP_REST_Response(array(
        'success' => true,
        'message' => __('Content copied from English successfully', 'kingdom-training'),
        'source_post_id' => $source_post_id,
        'target_post_id' => $target_post_id,
        'copied' => array(
            'title' => $source_post->post_title,
            'content_length' => strlen($source_post->post_content),
            'excerpt_length' => strlen($source_post->post_excerpt),
        ),
    ), 200);
}

/**
 * Chunked translation API handler
 * 
 * Handles translation in steps to avoid PHP timeout:
 * - init: Create job, chunk content, return chunk count
 * - title: Translate title only
 * - content_0..N: Translate content chunk N
 * - excerpt: Translate excerpt
 * - finalize: Assemble chunks, create/update post, link in Polylang
 * 
 * @param WP_REST_Request $request Request object
 * @return WP_REST_Response|WP_Error
 */
function gaal_api_translate_chunked($request) {
    $source_post_id = $request->get_param('source_post_id');
    $target_language = $request->get_param('target_language');
    $step = $request->get_param('step');
    $job_id = $request->get_param('job_id');
    $target_post_id = $request->get_param('target_post_id');
    
    GAAL_Translation_Logger::debug('Chunked translation request', array(
        'source_post_id' => $source_post_id,
        'target_language' => $target_language,
        'step' => $step,
        'job_id' => $job_id,
        'target_post_id' => $target_post_id,
    ));
    
    // Validate source post
    $source_post = get_post($source_post_id);
    if (!$source_post) {
        return new WP_Error('post_not_found', __('Source post not found', 'kingdom-training'), array('status' => 404));
    }
    
    // Initialize translation engine
    $engine = new GAAL_Translation_Engine();
    
    // Handle different steps
    switch ($step) {
        case 'init':
            return gaal_chunked_translate_init($source_post, $target_language, $engine, $target_post_id);
            
        case 'title':
            return gaal_chunked_translate_title($job_id, $target_language, $engine);
            
        case 'excerpt':
            return gaal_chunked_translate_excerpt($job_id, $target_language, $engine);
            
        case 'finalize':
            return gaal_chunked_translate_finalize($job_id, $source_post, $target_language, $engine);
            
        default:
            // Handle content_N steps
            if (preg_match('/^content_(\d+)$/', $step, $matches)) {
                $chunk_index = intval($matches[1]);
                return gaal_chunked_translate_content($job_id, $chunk_index, $target_language, $engine);
            }
            
            return new WP_Error('invalid_step', __('Invalid translation step', 'kingdom-training'), array('status' => 400));
    }
}

/**
 * Initialize chunked translation job
 * 
 * @param WP_Post $source_post Source post object
 * @param string $target_language Target language code
 * @param GAAL_Translation_Engine $engine Translation engine
 * @param int|null $target_post_id Optional existing post ID to update instead of creating new
 */
function gaal_chunked_translate_init($source_post, $target_language, $engine, $target_post_id = null) {
    // Get source content
    $content_processor = new GAAL_Content_Processor();
    $content = $content_processor->extract_translatable_content($source_post->ID);
    
    // Chunk the content (approximately 3000 chars per chunk, split on paragraph boundaries)
    $chunks = gaal_chunk_content($content['content'], 3000);
    
    // Create a translation job to store progress
    $job_id = GAAL_Translation_Job::create($source_post->ID, array($target_language));
    
    if (is_wp_error($job_id)) {
        return $job_id;
    }
    
    $job = new GAAL_Translation_Job($job_id);
    $job->set_status(GAAL_Translation_Job::STATUS_IN_PROGRESS);
    
    // Store chunks and metadata in job
    $job->set_chunks($chunks);
    $job->set_meta('title', $content['title']);
    $job->set_meta('excerpt', $content['excerpt']);
    $job->set_meta('target_language', $target_language);
    $job->set_meta('source_post_id', $source_post->ID);
    $job->set_meta('source_post_type', $source_post->post_type);
    $job->set_meta('source_post_author', $source_post->post_author);
    
    // Store target post ID if provided (for updating existing drafts)
    if ($target_post_id) {
        $job->set_meta('target_post_id', intval($target_post_id));
    }
    
    // Calculate total steps: init(done) + title + content chunks + excerpt + finalize
    $total_steps = 1 + 1 + count($chunks) + 1 + 1;
    $job->set_meta('total_steps', $total_steps);
    $job->set_meta('current_step', 1);
    
    GAAL_Translation_Logger::info('Chunked translation initialized', array(
        'job_id' => $job_id,
        'source_post_id' => $source_post->ID,
        'target_language' => $target_language,
        'target_post_id' => $target_post_id,
        'chunk_count' => count($chunks),
        'total_steps' => $total_steps,
    ));
    
    return new WP_REST_Response(array(
        'success' => true,
        'job_id' => $job_id,
        'chunk_count' => count($chunks),
        'total_steps' => $total_steps,
        'current_step' => 1,
        'next_step' => 'title',
        'message' => sprintf(__('Translation job created with %d content chunks', 'kingdom-training'), count($chunks)),
    ), 200);
}

/**
 * Translate title in chunked translation
 */
function gaal_chunked_translate_title($job_id, $target_language, $engine) {
    $job = new GAAL_Translation_Job($job_id);
    
    if (!$job->get_id()) {
        return new WP_Error('job_not_found', __('Translation job not found', 'kingdom-training'), array('status' => 404));
    }
    
    $title = $job->get_meta('title');
    $source_language = 'en';
    
    // Translate title
    $translated_title = $engine->translate_text($title, $target_language, $source_language);
    
    if (is_wp_error($translated_title)) {
        GAAL_Translation_Logger::error('Failed to translate title', array(
            'job_id' => $job_id,
            'error' => $translated_title->get_error_message(),
        ));
        return $translated_title;
    }
    
    // Store translated title
    $job->set_translated_meta('title', $translated_title);
    $current_step = $job->get_meta('current_step') + 1;
    $job->set_meta('current_step', $current_step);
    
    $chunks = $job->get_chunks();
    $next_step = count($chunks) > 0 ? 'content_0' : 'excerpt';
    
    GAAL_Translation_Logger::debug('Title translated', array(
        'job_id' => $job_id,
        'current_step' => $current_step,
    ));
    
    return new WP_REST_Response(array(
        'success' => true,
        'job_id' => $job_id,
        'current_step' => $current_step,
        'total_steps' => $job->get_meta('total_steps'),
        'next_step' => $next_step,
        'message' => __('Title translated', 'kingdom-training'),
    ), 200);
}

/**
 * Translate content chunk in chunked translation
 */
function gaal_chunked_translate_content($job_id, $chunk_index, $target_language, $engine) {
    $job = new GAAL_Translation_Job($job_id);
    
    if (!$job->get_id()) {
        return new WP_Error('job_not_found', __('Translation job not found', 'kingdom-training'), array('status' => 404));
    }
    
    $chunks = $job->get_chunks();
    
    if (!isset($chunks[$chunk_index])) {
        return new WP_Error('chunk_not_found', __('Content chunk not found', 'kingdom-training'), array('status' => 404));
    }
    
    $chunk = $chunks[$chunk_index];
    $source_language = 'en';
    
    // Translate chunk
    $translated_chunk = $engine->translate_text($chunk, $target_language, $source_language);
    
    if (is_wp_error($translated_chunk)) {
        GAAL_Translation_Logger::error('Failed to translate content chunk', array(
            'job_id' => $job_id,
            'chunk_index' => $chunk_index,
            'error' => $translated_chunk->get_error_message(),
        ));
        return $translated_chunk;
    }
    
    // Store translated chunk
    $job->set_translated_chunk($chunk_index, $translated_chunk);
    $current_step = $job->get_meta('current_step') + 1;
    $job->set_meta('current_step', $current_step);
    
    // Determine next step
    $next_chunk_index = $chunk_index + 1;
    if ($next_chunk_index < count($chunks)) {
        $next_step = 'content_' . $next_chunk_index;
    } else {
        $next_step = 'excerpt';
    }
    
    GAAL_Translation_Logger::debug('Content chunk translated', array(
        'job_id' => $job_id,
        'chunk_index' => $chunk_index,
        'current_step' => $current_step,
    ));
    
    return new WP_REST_Response(array(
        'success' => true,
        'job_id' => $job_id,
        'chunk_index' => $chunk_index,
        'current_step' => $current_step,
        'total_steps' => $job->get_meta('total_steps'),
        'next_step' => $next_step,
        'message' => sprintf(__('Content chunk %d translated', 'kingdom-training'), $chunk_index + 1),
    ), 200);
}

/**
 * Translate excerpt in chunked translation
 */
function gaal_chunked_translate_excerpt($job_id, $target_language, $engine) {
    $job = new GAAL_Translation_Job($job_id);
    
    if (!$job->get_id()) {
        return new WP_Error('job_not_found', __('Translation job not found', 'kingdom-training'), array('status' => 404));
    }
    
    $excerpt = $job->get_meta('excerpt');
    $source_language = 'en';
    
    // Translate excerpt (if not empty)
    $translated_excerpt = '';
    if (!empty($excerpt)) {
        $translated_excerpt = $engine->translate_text($excerpt, $target_language, $source_language);
        
        if (is_wp_error($translated_excerpt)) {
            GAAL_Translation_Logger::warning('Failed to translate excerpt, continuing without', array(
                'job_id' => $job_id,
                'error' => $translated_excerpt->get_error_message(),
            ));
            $translated_excerpt = ''; // Continue without excerpt
        }
    }
    
    // Store translated excerpt
    $job->set_translated_meta('excerpt', $translated_excerpt);
    $current_step = $job->get_meta('current_step') + 1;
    $job->set_meta('current_step', $current_step);
    
    GAAL_Translation_Logger::debug('Excerpt translated', array(
        'job_id' => $job_id,
        'current_step' => $current_step,
    ));
    
    return new WP_REST_Response(array(
        'success' => true,
        'job_id' => $job_id,
        'current_step' => $current_step,
        'total_steps' => $job->get_meta('total_steps'),
        'next_step' => 'finalize',
        'message' => __('Excerpt translated', 'kingdom-training'),
    ), 200);
}

/**
 * Finalize chunked translation - assemble and save post
 */
function gaal_chunked_translate_finalize($job_id, $source_post, $target_language, $engine) {
    $job = new GAAL_Translation_Job($job_id);
    
    if (!$job->get_id()) {
        return new WP_Error('job_not_found', __('Translation job not found', 'kingdom-training'), array('status' => 404));
    }
    
    // Get all translated parts
    $translated_title = $job->get_translated_meta('title');
    $translated_excerpt = $job->get_translated_meta('excerpt');
    $translated_chunks = $job->get_all_translated_chunks();
    
    // Reassemble content from chunks
    $translated_content = implode("\n\n", $translated_chunks);
    
    // Get source language
    $source_language = 'en';
    if (function_exists('pll_get_post_language')) {
        $source_language = pll_get_post_language($source_post->ID, 'slug') ?: 'en';
    }
    
    // Check if we have a target post ID from the job (for updating existing drafts)
    $target_post_id = $job->get_meta('target_post_id');
    
    // Check if translation already exists in Polylang
    $existing_translation = null;
    if (!$target_post_id && function_exists('pll_get_post_translations')) {
        $translations = pll_get_post_translations($source_post->ID);
        if (isset($translations[$target_language])) {
            $existing_translation = get_post($translations[$target_language]);
        }
    }
    
    // Prepare post data
    $default_status = get_option('gaal_translation_default_status', 'draft');
    $post_data = array(
        'post_title' => $translated_title,
        'post_content' => $translated_content,
        'post_excerpt' => $translated_excerpt,
        'post_status' => $default_status,
        'post_type' => $source_post->post_type,
        'post_author' => $source_post->post_author,
    );
    
    // Create or update translated post
    if ($target_post_id) {
        // Update existing draft (from batch creation)
        $post_data['ID'] = $target_post_id;
        $translated_post_id = wp_update_post($post_data);
        
        // Clear the "needs translation" flag
        if (!is_wp_error($translated_post_id)) {
            delete_post_meta($translated_post_id, '_gaal_needs_translation');
            update_post_meta($translated_post_id, '_gaal_translated_at', current_time('mysql'));
        }
    } elseif ($existing_translation) {
        $post_data['ID'] = $existing_translation->ID;
        $translated_post_id = wp_update_post($post_data);
    } else {
        $translated_post_id = wp_insert_post($post_data);
    }
    
    if (is_wp_error($translated_post_id)) {
        GAAL_Translation_Logger::error('Failed to create/update translated post', array(
            'job_id' => $job_id,
            'error' => $translated_post_id->get_error_message(),
        ));
        $job->fail($translated_post_id->get_error_message());
        return $translated_post_id;
    }
    
    // Set language in Polylang (only needed if not using target_post_id which already has language set)
    if (!$target_post_id && function_exists('pll_set_post_language')) {
        pll_set_post_language($translated_post_id, $target_language);
    }
    
    // Link translations in Polylang (only if not already linked via target_post_id)
    if (!$target_post_id && function_exists('pll_save_post_translations')) {
        $translations = array();
        if (function_exists('pll_get_post_translations')) {
            $existing_translations = pll_get_post_translations($source_post->ID);
            $translations = $existing_translations ?: array();
        }
        $translations[$source_language] = $source_post->ID;
        $translations[$target_language] = $translated_post_id;
        pll_save_post_translations($translations);
    }
    
    // Copy featured image if available (check if not already set)
    $thumbnail_id = get_post_thumbnail_id($source_post->ID);
    if ($thumbnail_id && !get_post_thumbnail_id($translated_post_id)) {
        set_post_thumbnail($translated_post_id, $thumbnail_id);
    }
    
    // Mark job as completed
    $job->complete();
    $current_step = $job->get_meta('current_step') + 1;
    $job->set_meta('current_step', $current_step);
    
    GAAL_Translation_Logger::info('Chunked translation completed', array(
        'job_id' => $job_id,
        'source_post_id' => $source_post->ID,
        'translated_post_id' => $translated_post_id,
        'target_post_id_used' => $target_post_id ? true : false,
        'target_language' => $target_language,
    ));
    
    return new WP_REST_Response(array(
        'success' => true,
        'job_id' => $job_id,
        'translated_post_id' => $translated_post_id,
        'current_step' => $current_step,
        'total_steps' => $job->get_meta('total_steps'),
        'next_step' => null,
        'message' => __('Translation completed successfully', 'kingdom-training'),
        'edit_url' => get_edit_post_link($translated_post_id, 'raw'),
    ), 200);
}

/**
 * Split content into chunks by paragraph boundaries
 * 
 * @param string $content HTML content to chunk
 * @param int $max_chars Maximum characters per chunk (approximate)
 * @return array Array of content chunks
 */
function gaal_chunk_content($content, $max_chars = 3000) {
    if (empty($content)) {
        return array();
    }
    
    // If content is small enough, return as single chunk
    if (strlen($content) <= $max_chars) {
        return array($content);
    }
    
    $chunks = array();
    $current_chunk = '';
    
    // Split by paragraph tags first
    // Handle both </p> and double newlines as paragraph boundaries
    $paragraphs = preg_split('/(<\/p>\s*|[\r\n]{2,})/', $content, -1, PREG_SPLIT_DELIM_CAPTURE);
    
    foreach ($paragraphs as $paragraph) {
        $paragraph = trim($paragraph);
        if (empty($paragraph)) {
            continue;
        }
        
        // If adding this paragraph would exceed max_chars, start a new chunk
        if (strlen($current_chunk) + strlen($paragraph) > $max_chars && !empty($current_chunk)) {
            $chunks[] = trim($current_chunk);
            $current_chunk = '';
        }
        
        $current_chunk .= $paragraph . ' ';
        
        // If this single paragraph is larger than max_chars, it becomes its own chunk
        if (strlen($current_chunk) >= $max_chars) {
            $chunks[] = trim($current_chunk);
            $current_chunk = '';
        }
    }
    
    // Don't forget the last chunk
    if (!empty(trim($current_chunk))) {
        $chunks[] = trim($current_chunk);
    }
    
    // If we ended up with no chunks (edge case), return original content as single chunk
    if (empty($chunks)) {
        return array($content);
    }
    
    return $chunks;
}

/**
 * Re-translate an existing post
 * 
 * @param WP_REST_Request $request Request object
 * @return WP_REST_Response|WP_Error
 */
function gaal_api_retranslate($request) {
    $post_id = $request->get_param('post_id');
    $target_language = $request->get_param('target_language');
    
    if (empty($post_id)) {
        return new WP_Error('missing_post_id', __('Post ID is required', 'kingdom-training'), array('status' => 400));
    }
    
    // Verify post exists
    $post = get_post($post_id);
    if (!$post) {
        return new WP_Error('post_not_found', __('Post not found', 'kingdom-training'), array('status' => 404));
    }
    
    // Perform re-translation
    $engine = new GAAL_Translation_Engine();
    $translated_post_id = $engine->retranslate_post($post_id, $target_language);
    
    if (is_wp_error($translated_post_id)) {
        return $translated_post_id;
    }
    
    return new WP_REST_Response(array(
        'success' => true,
        'translated_post_id' => $translated_post_id,
        'message' => __('Re-translation completed', 'kingdom-training'),
    ), 200);
}

/**
 * Get translation status for a post
 * 
 * @param WP_REST_Request $request Request object
 * @return WP_REST_Response|WP_Error
 */
function gaal_api_get_translation_status($request) {
    $post_id = $request->get_param('post_id');
    
    // Get available languages
    $enabled_languages = get_option('gaal_translation_enabled_languages', array());
    
    // Get source language
    $source_language = 'en';
    if (function_exists('pll_get_post_language')) {
        $source_language = pll_get_post_language($post_id, 'slug') ?: 'en';
    }
    
    // Get translations
    $translations = array();
    if (function_exists('pll_get_post_translations')) {
        $post_translations = pll_get_post_translations($post_id);
        if ($post_translations) {
            foreach ($post_translations as $lang => $trans_id) {
                if ($lang !== $source_language) {
                    $trans_post = get_post($trans_id);
                    $translations[$lang] = array(
                        'post_id' => $trans_id,
                        'status' => $trans_post ? $trans_post->post_status : 'missing',
                        'title' => $trans_post ? $trans_post->post_title : '',
                    );
                }
            }
        }
    }
    
    // Build status for each enabled language
    $status = array();
    foreach ($enabled_languages as $lang) {
        if ($lang === $source_language) {
            continue;
        }
        
        $status[$lang] = array(
            'language' => $lang,
            'exists' => isset($translations[$lang]),
            'post_id' => isset($translations[$lang]) ? $translations[$lang]['post_id'] : null,
            'post_status' => isset($translations[$lang]) ? $translations[$lang]['status'] : null,
        );
    }
    
    return new WP_REST_Response(array(
        'success' => true,
        'source_post_id' => $post_id,
        'source_language' => $source_language,
        'translations' => $status,
    ), 200);
}

/**
 * Resume an interrupted translation job
 * 
 * @param WP_REST_Request $request Request object
 * @return WP_REST_Response|WP_Error
 */
function gaal_api_resume_job($request) {
    $job_id = $request->get_param('job_id');
    
    if (empty($job_id)) {
        return new WP_Error('missing_job_id', __('Job ID is required', 'kingdom-training'), array('status' => 400));
    }
    
    $job = new GAAL_Translation_Job($job_id);
    
    if (!$job->get_id()) {
        return new WP_Error('job_not_found', __('Translation job not found', 'kingdom-training'), array('status' => 404));
    }
    
    // Resume job
    if (!$job->resume()) {
        return new WP_Error('cannot_resume', __('Job cannot be resumed', 'kingdom-training'), array('status' => 400));
    }
    
    // Get remaining languages
    $remaining_languages = $job->get_remaining_languages();
    $source_post_id = $job->get_source_post_id();
    
    if (empty($remaining_languages) || empty($source_post_id)) {
        return new WP_Error('nothing_to_resume', __('No remaining languages to translate', 'kingdom-training'), array('status' => 400));
    }
    
    // Continue translation
    $engine = new GAAL_Translation_Engine();
    $result = $engine->translate_all_languages($source_post_id, $job);
    
    if (is_wp_error($result)) {
        return $result;
    }
    
    return new WP_REST_Response(array(
        'success' => true,
        'job_id' => $job_id,
        'message' => __('Job resumed', 'kingdom-training'),
        'result' => $result,
    ), 200);
}

// AJAX handlers for background processing
function gaal_ajax_process_translation() {
    check_ajax_referer('gaal_translation_nonce', 'nonce');
    
    if (!current_user_can('edit_posts')) {
        wp_send_json_error(array('message' => __('Permission denied', 'kingdom-training')));
    }
    
    $job_id = isset($_POST['job_id']) ? intval($_POST['job_id']) : 0;
    
    if (empty($job_id)) {
        wp_send_json_error(array('message' => __('Job ID is required', 'kingdom-training')));
    }
    
    $job = new GAAL_Translation_Job($job_id);
    
    if (!$job->get_id()) {
        wp_send_json_error(array('message' => __('Job not found', 'kingdom-training')));
    }
    
    // Get remaining languages
    $remaining_languages = $job->get_remaining_languages();
    
    if (empty($remaining_languages)) {
        $job->complete();
        wp_send_json_success(array(
            'message' => __('All translations completed', 'kingdom-training'),
            'completed' => true,
        ));
    }
    
    // Process next language
    $source_post_id = $job->get_source_post_id();
    $next_language = array_shift($remaining_languages);
    
    $job->update_language_progress($next_language, 'in_progress');
    
    $engine = new GAAL_Translation_Engine();
    $result = $engine->translate_post($source_post_id, $next_language);
    
    if (is_wp_error($result)) {
        $job->update_language_progress($next_language, 'failed', $result->get_error_message());
        wp_send_json_error(array(
            'message' => $result->get_error_message(),
            'language' => $next_language,
        ));
    }
    
    $job->update_language_progress($next_language, 'completed');
    
    // Check if job is complete
    $remaining = $job->get_remaining_languages();
    if (empty($remaining)) {
        $job->complete();
    }
    
    wp_send_json_success(array(
        'message' => sprintf(__('Translation completed for %s', 'kingdom-training'), $next_language),
        'language' => $next_language,
        'completed' => empty($remaining),
        'progress' => $job->get_progress(),
    ));
}
add_action('wp_ajax_gaal_process_translation', 'gaal_ajax_process_translation');

/**
 * AJAX handler for testing API connections
 */
function gaal_ajax_test_api_connection() {
    check_ajax_referer('gaal_test_api_connection', 'nonce');
    
    if (!current_user_can('manage_options')) {
        wp_send_json_error(array('message' => __('Permission denied', 'kingdom-training')));
    }
    
    $api_type = isset($_POST['api_type']) ? sanitize_text_field($_POST['api_type']) : '';
    
    if (empty($api_type)) {
        wp_send_json_error(array('message' => __('API type is required', 'kingdom-training')));
    }
    
    if ($api_type === 'google_translate') {
        // Test Google Translate API
        $api_key = isset($_POST['api_key']) ? sanitize_text_field($_POST['api_key']) : '';
        
        if (empty($api_key)) {
            wp_send_json_error(array('message' => __('API key is required', 'kingdom-training')));
        }
        
        // Create Google Translate API instance
        $google_translate = new GAAL_Google_Translate_API($api_key);
        
        // Test with a simple translation
        $test_text = 'Hello';
        $result = $google_translate->translate($test_text, 'es', 'en');
        
        if (is_wp_error($result)) {
            wp_send_json_error(array('message' => $result->get_error_message()));
        }
        
        wp_send_json_success(array(
            'message' => __('Google Translate API connection successful', 'kingdom-training'),
            'test_translation' => $result,
        ));
        
    } elseif ($api_type === 'llm') {
        // Test LLM API
        $endpoint = isset($_POST['endpoint']) ? esc_url_raw($_POST['endpoint']) : '';
        $api_key = isset($_POST['api_key']) ? sanitize_text_field($_POST['api_key']) : '';
        $model = isset($_POST['model']) ? sanitize_text_field($_POST['model']) : '';
        
        if (empty($endpoint)) {
            wp_send_json_error(array('message' => __('Endpoint URL is required', 'kingdom-training')));
        }
        
        if (empty($api_key)) {
            wp_send_json_error(array('message' => __('API key is required', 'kingdom-training')));
        }
        
        if (empty($model)) {
            wp_send_json_error(array('message' => __('Model name is required', 'kingdom-training')));
        }
        
        // Detect provider from endpoint
        $provider = 'custom';
        if (strpos($endpoint, 'openai.com') !== false) {
            $provider = 'openai';
        } elseif (strpos($endpoint, 'anthropic.com') !== false) {
            $provider = 'anthropic';
        } elseif (strpos($endpoint, 'generativelanguage.googleapis.com') !== false) {
            $provider = 'gemini';
        } elseif (strpos($endpoint, 'openrouter.ai') !== false) {
            $provider = 'openrouter';
        }
        
        // Create LLM API instance
        $llm_api = new GAAL_LLM_API($endpoint, $api_key, $model, $provider);
        
        // Test connection
        $result = $llm_api->test_connection();
        
        if (is_wp_error($result)) {
            wp_send_json_error(array('message' => $result->get_error_message()));
        }
        
        wp_send_json_success(array(
            'message' => __('LLM API connection successful', 'kingdom-training'),
            'test_response' => substr($result, 0, 100), // First 100 chars of response
        ));
    } else {
        wp_send_json_error(array('message' => __('Invalid API type', 'kingdom-training')));
    }
}
add_action('wp_ajax_gaal_test_api_connection', 'gaal_ajax_test_api_connection');

// ============================================================================
// WP-CLI COMMANDS
// ============================================================================

/**
 * Register WP-CLI command for testing Google Translate API
 */
if (defined('WP_CLI') && WP_CLI) {
    require_once get_template_directory() . '/cli/test-google-translate.php';
}


