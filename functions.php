<?php
/**
 * Kingdom.Training Theme Functions
 * 
 * This theme is designed to work as a headless WordPress installation,
 * serving content via the REST API to a React/Vite frontend for Media to Disciple Making Movements training.
 */

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


