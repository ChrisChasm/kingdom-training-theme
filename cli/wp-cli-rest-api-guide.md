# WP-CLI REST API Interaction Guide for AI.Kingdom.Training

## Overview

Yes, you can interact with the REST API on AI.Kingdom.Training through WP-CLI, though WP-CLI doesn't have a built-in `rest` command. Here are several approaches:

## Available Methods

### 1. Using `wp eval` for Direct REST API Calls

You can use `wp eval` to execute PHP code that interacts with WordPress REST API functions:

```bash
# List all available REST routes
wp eval 'print_r( rest_get_server()->get_routes() );'

# Make an internal REST API request
wp eval '$request = new WP_REST_Request( "GET", "/wp/v2/posts" ); $response = rest_do_request( $request ); print_r( $response->get_data() );'
```

### 2. Using `wp eval-file` for Complex Scripts

Create PHP scripts that interact with the REST API and run them via WP-CLI:

```bash
wp eval-file path/to/your-rest-api-script.php
```

### 3. Making HTTP Requests to REST Endpoints

You can use `wp eval` with WordPress HTTP functions or external curl:

```bash
# Using WordPress HTTP API
wp eval '$response = wp_remote_get( "https://ai.kingdom.training/wp-json/wp/v2/posts" ); print_r( json_decode( wp_remote_retrieve_body( $response ) ) );'
```

### 4. Custom REST API Endpoints Found

Your site has custom REST API endpoints registered by the `disciple-tools-ai` plugin:

- **Namespace**: `disciple-tools-ai/v1`
- **Endpoints**:
  - `POST /disciple-tools-ai/v1/dt-ai-summarize` - Summarize posts
  - `POST /disciple-tools-ai/v1/dt-ai-create-filter` - Create filters

## Example Scripts

### Example 1: List All REST Routes

```php
<?php
// list-rest-routes.php
$server = rest_get_server();
$routes = $server->get_routes();
foreach ( $routes as $route => $handlers ) {
    echo $route . "\n";
}
```

Run with: `wp eval-file list-rest-routes.php`

### Example 2: Test Custom Endpoint

```php
<?php
// test-ai-endpoint.php
$request = new WP_REST_Request( 'GET', '/disciple-tools-ai/v1/' );
$response = rest_do_request( $request );
print_r( $response->get_data() );
```

### Example 3: Make External REST API Call

```php
<?php
// external-rest-call.php
$url = 'https://ai.kingdom.training/wp-json/wp/v2/posts?per_page=5';
$response = wp_remote_get( $url );

if ( is_wp_error( $response ) ) {
    echo "Error: " . $response->get_error_message();
} else {
    $body = wp_remote_retrieve_body( $response );
    $data = json_decode( $body, true );
    print_r( $data );
}
```

## Capacity Planning Use Cases

For capacity planning, you might want to:

1. **Monitor API Usage**: Track REST API endpoint calls
2. **Test Performance**: Measure response times for different endpoints
3. **Load Testing**: Simulate multiple concurrent requests
4. **Data Export**: Use REST API to export data for analysis

## Notes

- WP-CLI version installed: 2.12.0
- Database connection required for most WP-CLI commands
- REST API base URL: `https://ai.kingdom.training/wp-json/`
- Authentication may be required for protected endpoints

## Useful WP-CLI Commands for REST API Context

```bash
# Get site URL (for constructing REST API URLs)
wp option get siteurl

# Get list of users (useful for authentication)
wp user list

# Get post data (similar to REST API posts endpoint)
wp post list --format=json

# Get plugin information
wp plugin list
```
