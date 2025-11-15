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
}
add_action('rest_api_init', 'gaal_register_custom_fields');

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
    // Don't interfere with admin, REST API, or AJAX requests
    if (is_admin() || defined('REST_REQUEST') || defined('DOING_AJAX') || wp_doing_ajax()) {
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

    // Get the requested path
    $request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $request_uri = trim($request_uri, '/');
    
    // Remove WordPress base path if in subdirectory
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
    $has_extension = pathinfo($request_uri, PATHINFO_EXTENSION);
    
    if ($has_extension) {
        // It's a static asset request (JS, CSS, images, etc.)
        $file_path = $dist_dir . '/' . $request_uri;
        if (file_exists($file_path) && is_file($file_path)) {
            // Set proper content type
            $mime_type = mime_content_type($file_path);
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
add_action('template_redirect', 'kingdom_training_serve_frontend', 1);

