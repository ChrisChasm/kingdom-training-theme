<?php
/**
 * WP-CLI REST API Interaction Examples
 * 
 * Usage: wp eval-file wp-cli-rest-api-examples.php [function_name]
 * 
 * Examples:
 *   wp eval-file wp-cli-rest-api-examples.php list_routes
 *   wp eval-file wp-cli-rest-api-examples.php test_custom_endpoints
 *   wp eval-file wp-cli-rest-api-examples.php get_posts_via_rest
 */

// Get the function name from command line arguments
$function_name = isset( $argv[1] ) ? $argv[1] : 'help';

/**
 * List all available REST API routes
 */
function list_routes() {
    $server = rest_get_server();
    $routes = $server->get_routes();
    
    echo "Available REST API Routes:\n";
    echo str_repeat( "=", 80 ) . "\n";
    
    foreach ( $routes as $route => $handlers ) {
        $methods = array();
        foreach ( $handlers as $handler ) {
            if ( isset( $handler['methods'] ) ) {
                $methods = array_merge( $methods, array_keys( $handler['methods'] ) );
            }
        }
        $methods = array_unique( $methods );
        echo sprintf( "%-50s %s\n", $route, implode( ', ', $methods ) );
    }
}

/**
 * Test custom REST API endpoints from disciple-tools-ai plugin
 */
function test_custom_endpoints() {
    $namespace = 'disciple-tools-ai/v1';
    
    echo "Testing Custom REST API Endpoints:\n";
    echo str_repeat( "=", 80 ) . "\n";
    
    // Test namespace index
    $request = new WP_REST_Request( 'GET', '/' . $namespace );
    $response = rest_do_request( $request );
    
    if ( $response->is_error() ) {
        echo "Error accessing namespace: " . $response->as_error()->get_error_message() . "\n";
    } else {
        echo "Namespace accessible: " . $namespace . "\n";
        $data = $response->get_data();
        if ( ! empty( $data ) ) {
            echo "Available endpoints:\n";
            print_r( $data );
        }
    }
}

/**
 * Get posts via REST API (internal call)
 */
function get_posts_via_rest() {
    $request = new WP_REST_Request( 'GET', '/wp/v2/posts' );
    $request->set_param( 'per_page', 5 );
    $request->set_param( 'status', 'publish' );
    
    $response = rest_do_request( $request );
    
    if ( $response->is_error() ) {
        echo "Error: " . $response->as_error()->get_error_message() . "\n";
    } else {
        $data = $response->get_data();
        echo "Posts retrieved via REST API:\n";
        echo str_repeat( "=", 80 ) . "\n";
        foreach ( $data as $post ) {
            echo sprintf( "ID: %d | Title: %s | Date: %s\n", 
                $post['id'], 
                $post['title']['rendered'], 
                $post['date'] 
            );
        }
    }
}

/**
 * Get REST API base URL
 */
function get_rest_url_info() {
    $base_url = get_rest_url();
    echo "REST API Base URL: " . $base_url . "\n";
    echo "Site URL: " . get_site_url() . "\n";
    echo "REST API Prefix: " . rest_get_url_prefix() . "\n";
}

/**
 * Test HTTP request to REST API endpoint
 */
function test_http_request() {
    $url = get_rest_url( null, '/wp/v2/posts?per_page=3' );
    
    echo "Making HTTP request to: " . $url . "\n";
    echo str_repeat( "=", 80 ) . "\n";
    
    $response = wp_remote_get( $url, array(
        'timeout' => 10,
        'headers' => array(
            'Content-Type' => 'application/json',
        ),
    ) );
    
    if ( is_wp_error( $response ) ) {
        echo "Error: " . $response->get_error_message() . "\n";
    } else {
        $status_code = wp_remote_retrieve_response_code( $response );
        $body = wp_remote_retrieve_body( $response );
        $data = json_decode( $body, true );
        
        echo "Status Code: " . $status_code . "\n";
        echo "Response:\n";
        print_r( $data );
    }
}

/**
 * Show help information
 */
function help() {
    echo "WP-CLI REST API Examples\n";
    echo str_repeat( "=", 80 ) . "\n";
    echo "Available functions:\n\n";
    echo "  list_routes              - List all available REST API routes\n";
    echo "  test_custom_endpoints    - Test custom disciple-tools-ai endpoints\n";
    echo "  get_posts_via_rest       - Get posts using internal REST API\n";
    echo "  get_rest_url_info        - Show REST API URL information\n";
    echo "  test_http_request        - Test HTTP request to REST API\n";
    echo "  help                     - Show this help message\n\n";
    echo "Usage: wp eval-file wp-cli-rest-api-examples.php [function_name]\n";
}

// Execute the requested function
if ( function_exists( $function_name ) ) {
    $function_name();
} else {
    echo "Error: Function '$function_name' not found.\n\n";
    help();
}
