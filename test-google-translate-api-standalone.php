<?php
/**
 * Standalone Google Translate API Test
 * 
 * Usage: 
 *   php test-google-translate-api-standalone.php [API_KEY]
 *   Or set API_KEY environment variable
 */

// Get API key from command line argument or environment variable
$api_key = isset($argv[1]) ? $argv[1] : (getenv('GOOGLE_TRANSLATE_API_KEY') ?: '');

// If no API key provided, try to load from WordPress
if (empty($api_key)) {
    // Try common WordPress paths - check for wp-load.php directly
    $wp_load_paths = array(
        __DIR__ . '/../../wordpress/wp-load.php',
        __DIR__ . '/../../wp-load.php',
        __DIR__ . '/../../../wp-load.php',
        dirname(dirname(dirname(__DIR__))) . '/wp-load.php',
    );
    
    foreach ($wp_load_paths as $wp_load_path) {
        if (file_exists($wp_load_path)) {
            try {
                // Suppress warnings for CLI execution
                $old_error_reporting = error_reporting(E_ERROR | E_PARSE);
                $_SERVER['HTTP_HOST'] = 'localhost'; // Set a default host
                require_once $wp_load_path;
                error_reporting($old_error_reporting);
                
                if (function_exists('get_option')) {
                    $api_key = get_option('gaal_translation_google_api_key', '');
                    if (!empty($api_key)) {
                        echo "✓ Loaded API key from WordPress\n";
                        break;
                    }
                }
            } catch (Exception $e) {
                // Continue to next path
                error_reporting($old_error_reporting);
                continue;
            }
        }
    }
}

if (empty($api_key)) {
    die("Error: Google Translate API key is required.\n\nUsage:\n  php test-google-translate-api-standalone.php [API_KEY]\n  Or set GOOGLE_TRANSLATE_API_KEY environment variable\n\n");
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

// Make request using curl
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_VERBOSE, false);

$response_body = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);
curl_close($ch);

echo "HTTP Status Code: {$http_code}\n\n";

if (!empty($curl_error)) {
    echo "❌ cURL Error: {$curl_error}\n\n";
    exit(1);
}

echo "Response Body:\n";
echo str_repeat("=", 80) . "\n";
echo $response_body . "\n";
echo str_repeat("=", 80) . "\n\n";

// Parse JSON response
$response_data = json_decode($response_body, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo "❌ JSON Parse Error: " . json_last_error_msg() . "\n";
    exit(1);
}

echo "Parsed Response:\n";
print_r($response_data);
echo "\n";

// Check for errors
if ($http_code !== 200) {
    echo "❌ API Error Detected:\n";
    if (isset($response_data['error']['message'])) {
        echo "  Message: " . $response_data['error']['message'] . "\n";
    }
    if (isset($response_data['error']['errors'])) {
        foreach ($response_data['error']['errors'] as $error) {
            echo "  Error Details:\n";
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
    exit(1);
} else {
    // Check for successful translation
    if (isset($response_data['data']['translations'][0]['translatedText'])) {
        $translated = $response_data['data']['translations'][0]['translatedText'];
        echo "✅ Translation Successful:\n";
        echo "  Translated Text: {$translated}\n";
        exit(0);
    } else {
        echo "❌ Unexpected response format\n";
        exit(1);
    }
}