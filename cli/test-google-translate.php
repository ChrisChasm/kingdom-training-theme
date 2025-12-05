<?php
/**
 * WP-CLI command to test Google Translate API
 * 
 * Usage: wp test-google-translate
 */

if (!defined('WP_CLI')) {
    return;
}

WP_CLI::add_command('test-google-translate', function($args, $assoc_args) {
    // Get API key from WordPress options
    $api_key = get_option('gaal_translation_google_api_key', '');
    
    if (empty($api_key)) {
        WP_CLI::error('Google Translate API key is not configured.');
        WP_CLI::line('Please configure it in: Settings > Translation Automation');
        return;
    }
    
    WP_CLI::line('Testing Google Translate API...');
    WP_CLI::line('API Key: ' . substr($api_key, 0, 10) . '...' . substr($api_key, -4));
    WP_CLI::line('');
    
    // Test parameters
    $test_text = isset($assoc_args['text']) ? $assoc_args['text'] : 'Hello, world!';
    $source_language = isset($assoc_args['from']) ? $assoc_args['from'] : 'en';
    $target_language = isset($assoc_args['to']) ? $assoc_args['to'] : 'es';
    
    WP_CLI::line("Test Translation:");
    WP_CLI::line("  Source: {$test_text}");
    WP_CLI::line("  From: {$source_language}");
    WP_CLI::line("  To: {$target_language}");
    WP_CLI::line('');
    
    // Prepare request parameters
    $params = array(
        'key' => $api_key,
        'q' => $test_text,
        'target' => $target_language,
        'source' => $source_language,
    );
    
    // Build URL
    $url = 'https://translation.googleapis.com/language/translate/v2?' . http_build_query($params);
    
    WP_CLI::line('Making API request...');
    WP_CLI::line('');
    
    // Make request using WordPress HTTP API
    $response = wp_remote_get($url, array('timeout' => 30));
    
    if (is_wp_error($response)) {
        WP_CLI::error('Request failed: ' . $response->get_error_message());
        return;
    }
    
    $http_code = wp_remote_retrieve_response_code($response);
    $response_body = wp_remote_retrieve_body($response);
    $response_data = json_decode($response_body, true);
    
    WP_CLI::line("HTTP Status Code: {$http_code}");
    WP_CLI::line('');
    WP_CLI::line("Response Body:");
    WP_CLI::line(str_repeat("=", 80));
    WP_CLI::line($response_body);
    WP_CLI::line(str_repeat("=", 80));
    WP_CLI::line('');
    
    if ($http_code !== 200) {
        WP_CLI::error('API Error Detected:');
        if (isset($response_data['error']['message'])) {
            WP_CLI::line('  Message: ' . $response_data['error']['message']);
        }
        if (isset($response_data['error']['errors'])) {
            foreach ($response_data['error']['errors'] as $error) {
                WP_CLI::line('  Error Details:');
                if (isset($error['message'])) {
                    WP_CLI::line('    Message: ' . $error['message']);
                }
                if (isset($error['reason'])) {
                    WP_CLI::line('    Reason: ' . $error['reason']);
                }
                if (isset($error['domain'])) {
                    WP_CLI::line('    Domain: ' . $error['domain']);
                }
            }
        }
        return;
    }
    
    // Check for successful translation
    if (isset($response_data['data']['translations'][0]['translatedText'])) {
        $translated = $response_data['data']['translations'][0]['translatedText'];
        WP_CLI::success('Translation Successful!');
        WP_CLI::line("  Translated Text: {$translated}");
    } else {
        WP_CLI::error('Unexpected response format');
        WP_CLI::line('Response data:');
        WP_CLI::line(print_r($response_data, true));
    }
});