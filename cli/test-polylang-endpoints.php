<?php
/**
 * Test Polylang REST API Endpoints
 * 
 * Usage: wp eval-file cli/test-polylang-endpoints.php
 */

echo "Testing Polylang REST API Endpoints\n";
echo str_repeat("=", 80) . "\n\n";

// Check if Polylang is active
if (!function_exists('pll_get_post_language')) {
    echo "❌ ERROR: Polylang plugin is not active or not installed.\n";
    echo "Please install and activate the Polylang plugin first.\n";
    exit(1);
}

echo "✅ Polylang is active\n\n";

// Test 1: Check if languages exist
echo "Test 1: Checking available languages\n";
echo str_repeat("-", 80) . "\n";

if (function_exists('PLL')) {
    $model = PLL()->model;
    $languages = $model->get_languages_list();
    
    if (empty($languages)) {
        echo "⚠️  WARNING: No languages configured in Polylang.\n";
        echo "Please add languages in WordPress Admin > Languages > Languages\n\n";
    } else {
        echo "Found " . count($languages) . " language(s):\n";
        foreach ($languages as $lang) {
            echo sprintf("  - %s (%s) - Default: %s\n", 
                $lang->name, 
                $lang->slug,
                $lang->is_default ? 'Yes' : 'No'
            );
        }
        echo "\n";
    }
} else {
    echo "❌ ERROR: Could not access Polylang model\n\n";
}

// Test 2: Test REST API endpoint directly
echo "Test 2: Testing Polylang REST API endpoint\n";
echo str_repeat("-", 80) . "\n";

$rest_url = get_rest_url(null, '/pll/v1/languages');
echo "REST API URL: " . $rest_url . "\n";

$response = wp_remote_get($rest_url, array(
    'timeout' => 10,
    'headers' => array(
        'Content-Type' => 'application/json',
    ),
));

if (is_wp_error($response)) {
    echo "❌ ERROR: " . $response->get_error_message() . "\n\n";
} else {
    $status_code = wp_remote_retrieve_response_code($response);
    $body = wp_remote_retrieve_body($response);
    
    echo "Status Code: " . $status_code . "\n";
    
    if ($status_code === 200) {
        $data = json_decode($body, true);
        if (!empty($data)) {
            echo "✅ SUCCESS: Languages endpoint is working\n";
            echo "Found " . count($data) . " language(s) via REST API:\n";
            foreach ($data as $lang) {
                echo sprintf("  - %s (%s) - Default: %s\n", 
                    $lang['name'] ?? 'N/A', 
                    $lang['slug'] ?? 'N/A',
                    isset($lang['is_default']) && $lang['is_default'] ? 'Yes' : 'No'
                );
            }
        } else {
            echo "⚠️  WARNING: Endpoint returned empty array\n";
            echo "Response: " . $body . "\n";
        }
    } else {
        echo "❌ ERROR: Unexpected status code\n";
        echo "Response: " . $body . "\n";
    }
}

echo "\n";

// Test 3: Test language fields on posts
echo "Test 3: Testing language fields on REST API posts\n";
echo str_repeat("-", 80) . "\n";

$request = new WP_REST_Request('GET', '/wp/v2/posts');
$request->set_param('per_page', 1);
$response = rest_do_request($request);

if ($response->is_error()) {
    echo "❌ ERROR: " . $response->as_error()->get_error_message() . "\n\n";
} else {
    $data = $response->get_data();
    if (!empty($data)) {
        $post = $data[0];
        echo "Testing post ID: " . $post['id'] . "\n";
        echo "Post title: " . $post['title']['rendered'] . "\n";
        
        if (isset($post['language'])) {
            echo "✅ SUCCESS: Language field exists: " . ($post['language'] ?? 'null') . "\n";
        } else {
            echo "⚠️  WARNING: Language field not found in REST API response\n";
        }
        
        if (isset($post['translations'])) {
            $translation_count = is_array($post['translations']) ? count($post['translations']) : 0;
            echo "✅ SUCCESS: Translations field exists with " . $translation_count . " translation(s)\n";
        } else {
            echo "⚠️  WARNING: Translations field not found in REST API response\n";
        }
    } else {
        echo "⚠️  WARNING: No posts found to test\n";
    }
}

echo "\n";

// Test 4: Test language filtering
echo "Test 4: Testing language filtering on REST API\n";
echo str_repeat("-", 80) . "\n";

if (!empty($languages)) {
    $test_lang = $languages[0]->slug;
    echo "Testing with language: " . $test_lang . "\n";
    
    $request = new WP_REST_Request('GET', '/wp/v2/posts');
    $request->set_param('lang', $test_lang);
    $request->set_param('per_page', 5);
    $response = rest_do_request($request);
    
    if ($response->is_error()) {
        echo "❌ ERROR: " . $response->as_error()->get_error_message() . "\n";
    } else {
        $data = $response->get_data();
        echo "✅ SUCCESS: Language filtering works\n";
        echo "Found " . count($data) . " post(s) for language " . $test_lang . "\n";
    }
} else {
    echo "⚠️  SKIPPED: No languages configured\n";
}

echo "\n";
echo str_repeat("=", 80) . "\n";
echo "Testing complete!\n";

