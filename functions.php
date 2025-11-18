<?php
/**
 * Kingdom.Training Theme Functions
 * 
 * This theme is designed to work as a headless WordPress installation,
 * serving content via the REST API to a React/Vite frontend for Media to Disciple Making Movements training.
 */

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

// Register Custom Post Types
function gaal_register_custom_post_types() {
    
    // Strategy Course Post Type
    register_post_type('strategy_course', array(
        'labels' => array(
            'name' => __('Strategy Courses', 'kingdom-training'),
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
        'taxonomies' => array('category', 'post_tag'),
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
        'taxonomies' => array('category', 'post_tag'),
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
        'taxonomies' => array('category', 'post_tag'),
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
            return array(
                'id' => $user->ID,
                'name' => $user->display_name,
                'email' => $user->user_email,
                'avatar' => get_avatar_url($user->ID),
                'capabilities' => $user->allcaps,
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
            $user_id = get_current_user_id();
            
            if (!$user_id) {
                return new WP_Error('not_authenticated', 'User is not logged in', array('status' => 401));
            }
            
            $user = get_userdata($user_id);
            
            if (!$user) {
                return new WP_Error('user_not_found', 'User not found', array('status' => 404));
            }
            
            return array(
                'id' => $user->ID,
                'name' => $user->display_name,
                'email' => $user->user_email,
                'avatar' => get_avatar_url($user->ID),
                'capabilities' => $user->allcaps,
            );
        },
        'permission_callback' => '__return_true',
    ));
}
add_action('rest_api_init', 'gaal_register_auth_api');

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
            // Set cache headers for assets
            header('Cache-Control: public, max-age=31536000');
            readfile($file_path);
            exit;
        }
    }
    
    // It's a route - serve index.html for client-side routing
    // React Router will handle the routing on the client side
    $file_path = $dist_dir . '/index.html';
    if (file_exists($file_path) && is_file($file_path)) {
        header('Content-Type: text/html');
        $content = file_get_contents($file_path);
        
        // Get theme URI for asset paths
        $theme_uri = get_template_directory_uri() . '/dist';
        
        // Replace absolute asset paths with theme-relative paths
        // Handle href="/assets/..." and src="/assets/..." (most common case)
        $content = preg_replace('/(href|src)=["\']\/(assets\/[^"\']+)["\']/', '$1="' . $theme_uri . '/$2"', $content);
        
        // Handle other files in dist directory (like /kt-logo-header.webp, /vite.svg, /robots.txt, etc.)
        // Only replace if the file exists in the dist directory
        $content = preg_replace_callback(
            '/(href|src)=["\']\/([^"\']+\.[a-zA-Z0-9]+)["\']/',
            function($matches) use ($dist_dir, $theme_uri) {
                $file_path = $dist_dir . '/' . $matches[2];
                // Only replace if file exists in dist directory and is not a WordPress path
                if (file_exists($file_path) && strpos($matches[2], 'wp-') !== 0 && strpos($matches[2], 'wp/') !== 0) {
                    return $matches[1] . '="' . $theme_uri . '/' . $matches[2] . '"';
                }
                return $matches[0]; // Keep original if file doesn't exist or is a WordPress path
            },
            $content
        );
        
        echo $content;
        exit;
    }
}
// Hook early to catch REST API requests before they're processed
// Use a high priority to run before other template_redirect hooks
add_action('template_redirect', 'kingdom_training_serve_frontend', 1);


