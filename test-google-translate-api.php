<?php
/**
 * Test Google Translate API from command line
 * 
 * Usage: wp eval-file test-google-translate-api.php
 * Or: php test-google-translate-api.php (if WordPress is loaded)
 */

// Load WordPress if not already loaded
if (!defined('ABSPATH')) {
    // Try to find wp-load.php
    $wp_load_paths = array(
        __DIR__ . '/../../wp-load.php',
        __DIR__ . '/../../../wp-load.php',
        dirname(dirname(dirname(__DIR__))) . '/wp-load.php',
    );
    
    $loaded = false;
    foreach ($wp_load_paths as $path) {
        if (file_exists($path)) {
            require_once $path;
            $loaded = true;
            break;
        }
    }
    
    if (!$loaded) {
        die("Error: Could not find wp-load.php. Please run this script using: wp eval-file test-google-translate-api.php\n");
    }
}

// Get API key from WordPress options
$api_key = get_option('gaal_translation_google_api_key', '');

if (empty($api_key)) {
    die("Error: Google Translate API key is not configured.\nPlease set it in WordPress admin: Settings > Translation Automation\n");
}

echo "Testing Google Translate API...\n";
echo "API Key: " . substr($api_key, 0, 10) . "..." . substr($api_key, -4) . "\n\n";

// Test parameters
$test_text = "Hello, world!";
$source_language = "en";
$target_language = "es";

echo "Test Translation:\n";
echo "  Source: {$test_text}\n";
echo "  From: {$source_language}\n";
echo "  To: {$target_language}\n\n";

// Prepare request parameters
$params = array(
    'key' => $api_key,
    'q' => $test_text,
    'target' => $target_language,
    'source' => $source_language,
);

// Build URL
$url = 'https://translation.googleapis.com/language/translate/v2?' . http_build_query($params);

echo "Request URL: " . str_replace($api_key, '***KEY***', $url) . "\n\n";

// Make request using curl (more reliable for CLI)
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

$response_body = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);
curl_close($ch);

echo "HTTP Status Code: {$http_code}\n\n";

if (!empty($curl_error)) {
    echo "cURL Error: {$curl_error}\n\n";
}

echo "Response Body:\n";
echo str_repeat("=", 80) . "\n";
echo $response_body . "\n";
echo str_repeat("=", 80) . "\n\n";

// Parse JSON response
$response_data = json_decode($response_body, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo "JSON Parse Error: " . json_last_error_msg() . "\n";
} else {
    echo "Parsed Response:\n";
    print_r($response_data);
    echo "\n";
    
    // Check for errors
    if ($http_code !== 200) {
        echo "\n❌ API Error Detected:\n";
        if (isset($response_data['error']['message'])) {
            echo "  Message: " . $response_data['error']['message'] . "\n";
        }
        if (isset($response_data['error']['errors'])) {
            foreach ($response_data['error']['errors'] as $error) {
                echo "  Error:\n";
                if (isset($error['message'])) {
                    echo "    Message: " . $error['message'] . "\n";
                }
                if (isset($error['reason'])) {
                    echo "    Reason: " . $error['reason'] . "\n";
                }
                if (isset($error['domain'])) {
                    echo "    Domain: " . $error['domain'] . "\n";
                }
            }
        }
    } else {
        // Check for successful translation
        if (isset($response_data['data']['translations'][0]['translatedText'])) {
            $translated = $response_data['data']['translations'][0]['translatedText'];
            echo "\n✅ Translation Successful:\n";
            echo "  Translated Text: {$translated}\n";
        } else {
            echo "\n❌ Unexpected response format\n";
        }
    }
}

echo "\n";