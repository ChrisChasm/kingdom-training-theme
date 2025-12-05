<?php
/**
 * Google Translate API Integration
 * 
 * Handles translation via Google Cloud Translation API
 */

if (!class_exists('GAAL_Google_Translate_API')) {
    class GAAL_Google_Translate_API extends GAAL_Translation_API {
        
        /**
         * API endpoint URL
         */
        const API_ENDPOINT = 'https://translation.googleapis.com/language/translate/v2';
        
        /**
         * Translate text using Google Translate API
         * 
         * @param string $text Text to translate
         * @param string $target_language Target language code (e.g., 'es', 'fr')
         * @param string $source_language Source language code (optional, auto-detect if empty)
         * @return string|WP_Error Translated text or error
         */
        public function translate($text, $target_language, $source_language = '') {
            // Debug: Log API key status
            $api_key_status = empty($this->api_key) ? 'EMPTY' : 'Set (length: ' . strlen($this->api_key) . ', starts with: ' . substr($this->api_key, 0, 8) . '...)';
            GAAL_Translation_Logger::debug('Google Translate API called', array(
                'api_key_status' => $api_key_status,
                'text_length' => strlen($text),
                'text_preview' => substr($text, 0, 100) . (strlen($text) > 100 ? '...' : ''),
                'target_language' => $target_language,
                'source_language' => $source_language,
            ));
            
            if (empty($this->api_key)) {
                return new WP_Error('api_not_configured', __('Google Translate API key is not configured', 'kingdom-training'));
            }
            
            if (empty($text)) {
                return '';
            }
            
            // For long texts, use POST method instead of GET to avoid URL length limits
            $text_length = strlen($text);
            $use_post = $text_length > 1000; // Use POST for texts longer than 1000 chars
            
            GAAL_Translation_Logger::debug('Request method decision', array(
                'text_length' => $text_length,
                'use_post' => $use_post,
            ));
            
            if ($use_post) {
                // Use POST for longer texts
                $url = self::API_ENDPOINT . '?key=' . urlencode($this->api_key);
                
                $body = array(
                    'q' => $text,
                    'target' => $target_language,
                );
                
                if (!empty($source_language)) {
                    $body['source'] = $source_language;
                }
                
                $args = array(
                    'method' => 'POST',
                    'timeout' => 60,
                    'headers' => array(
                        'Content-Type' => 'application/x-www-form-urlencoded',
                    ),
                    'body' => $body,
                );
                
                GAAL_Translation_Logger::debug('Making POST request', array(
                    'url' => preg_replace('/key=[^&]+/', 'key=***REDACTED***', $url),
                    'body_keys' => array_keys($body),
                ));
            } else {
                // Use GET for shorter texts
                $params = array(
                    'key' => $this->api_key,
                    'q' => $text,
                    'target' => $target_language,
                );
                
                if (!empty($source_language)) {
                    $params['source'] = $source_language;
                }
                
                // Build URL
                $url = self::API_ENDPOINT . '?' . http_build_query($params);
                
                // Log URL length (with key redacted)
                $url_for_logging = preg_replace('/key=[^&]+/', 'key=***REDACTED***', $url);
                GAAL_Translation_Logger::debug('Making GET request', array(
                    'url_length' => strlen($url),
                    'url_preview' => substr($url_for_logging, 0, 200) . (strlen($url_for_logging) > 200 ? '...' : ''),
                ));
                
                $args = array(
                    'method' => 'GET',
                    'timeout' => 30,
                );
            }
            
            $response = wp_remote_request($url, $args);
            
            if (is_wp_error($response)) {
                return new WP_Error(
                    'api_request_failed',
                    __('Failed to connect to Google Translate API', 'kingdom-training') . ': ' . $response->get_error_message(),
                    array('original_error' => $response)
                );
            }
            
            $response_code = wp_remote_retrieve_response_code($response);
            $response_body = wp_remote_retrieve_body($response);
            $response_data = json_decode($response_body, true);
            
            // Handle errors
            if ($response_code !== 200) {
                // Extract error message from various possible formats
                $error_message = __('Google Translate API error', 'kingdom-training');
                $error_details = array();
                
                if (isset($response_data['error']['message'])) {
                    $error_message = $response_data['error']['message'];
                } elseif (isset($response_data['error']['errors']) && is_array($response_data['error']['errors'])) {
                    // Handle multiple errors
                    $error_messages = array();
                    foreach ($response_data['error']['errors'] as $error) {
                        if (isset($error['message'])) {
                            $error_messages[] = $error['message'];
                        }
                        if (isset($error['reason'])) {
                            $error_details[] = 'Reason: ' . $error['reason'];
                        }
                        if (isset($error['domain'])) {
                            $error_details[] = 'Domain: ' . $error['domain'];
                        }
                    }
                    if (!empty($error_messages)) {
                        $error_message = implode('; ', $error_messages);
                    }
                } elseif (isset($response_data['error']['status'])) {
                    $error_message = $response_data['error']['status'];
                }
                
                // Add HTTP status code to error message
                $error_message = sprintf(__('Google Translate API error (HTTP %d)', 'kingdom-training'), $response_code) . ': ' . $error_message;
                
                // Log the full error for debugging
                GAAL_Translation_Logger::error('Google Translate API error', array(
                    'status_code' => $response_code,
                    'error_message' => $error_message,
                    'response' => $response_data,
                    'raw_response' => $response_body,
                ));
                
                // Combine error message with details
                if (!empty($error_details)) {
                    $error_message .= ' - ' . implode(', ', $error_details);
                }
                
                return new WP_Error(
                    'api_error',
                    $error_message,
                    array(
                        'status' => $response_code,
                        'response' => $response_data,
                        'raw_response' => $response_body,
                    )
                );
            }
            
            // Extract translated text
            if (isset($response_data['data']['translations'][0]['translatedText'])) {
                return $response_data['data']['translations'][0]['translatedText'];
            }
            
            return new WP_Error(
                'invalid_response',
                __('Invalid response from Google Translate API', 'kingdom-training'),
                array('response' => $response_data)
            );
        }
        
        /**
         * Test API connectivity with a simple translation
         * 
         * @return array|WP_Error Test result or error
         */
        public function test_connection() {
            if (empty($this->api_key)) {
                return new WP_Error('api_not_configured', 'API key is not configured');
            }
            
            // Simple test: translate "Hello" to Spanish
            $test_text = 'Hello';
            $result = $this->translate($test_text, 'es', 'en');
            
            if (is_wp_error($result)) {
                return $result;
            }
            
            return array(
                'success' => true,
                'original' => $test_text,
                'translated' => $result,
                'api_key_preview' => substr($this->api_key, 0, 8) . '...',
            );
        }
        
        /**
         * Translate multiple texts in a single request
         * 
         * @param array $texts Array of texts to translate
         * @param string $target_language Target language code
         * @param string $source_language Source language code (optional)
         * @return array|WP_Error Array of translated texts or error
         */
        public function translate_batch($texts, $target_language, $source_language = '') {
            if (empty($this->api_key)) {
                return new WP_Error('api_not_configured', __('Google Translate API key is not configured', 'kingdom-training'));
            }
            
            if (empty($texts) || !is_array($texts)) {
                return array();
            }
            
            // Prepare request parameters
            $params = array(
                'key' => $this->api_key,
                'target' => $target_language,
            );
            
            if (!empty($source_language)) {
                $params['source'] = $source_language;
            }
            
            // Add all texts as 'q' parameters
            foreach ($texts as $text) {
                $params['q'][] = $text;
            }
            
            // Build URL
            $url = self::API_ENDPOINT . '?' . http_build_query($params, '', '&', PHP_QUERY_RFC3986);
            
            // Make request
            $args = array(
                'method' => 'GET',
                'timeout' => 60, // Longer timeout for batch requests
            );
            
            $response = wp_remote_request($url, $args);
            
            if (is_wp_error($response)) {
                return new WP_Error(
                    'api_request_failed',
                    __('Failed to connect to Google Translate API', 'kingdom-training') . ': ' . $response->get_error_message(),
                    array('original_error' => $response)
                );
            }
            
            $response_code = wp_remote_retrieve_response_code($response);
            $response_body = wp_remote_retrieve_body($response);
            $response_data = json_decode($response_body, true);
            
            // Handle errors
            if ($response_code !== 200) {
                // Extract error message from various possible formats
                $error_message = __('Google Translate API error', 'kingdom-training');
                $error_details = array();
                
                if (isset($response_data['error']['message'])) {
                    $error_message = $response_data['error']['message'];
                } elseif (isset($response_data['error']['errors']) && is_array($response_data['error']['errors'])) {
                    // Handle multiple errors
                    $error_messages = array();
                    foreach ($response_data['error']['errors'] as $error) {
                        if (isset($error['message'])) {
                            $error_messages[] = $error['message'];
                        }
                        if (isset($error['reason'])) {
                            $error_details[] = 'Reason: ' . $error['reason'];
                        }
                        if (isset($error['domain'])) {
                            $error_details[] = 'Domain: ' . $error['domain'];
                        }
                    }
                    if (!empty($error_messages)) {
                        $error_message = implode('; ', $error_messages);
                    }
                } elseif (isset($response_data['error']['status'])) {
                    $error_message = $response_data['error']['status'];
                }
                
                // Add HTTP status code to error message
                $error_message = sprintf(__('Google Translate API error (HTTP %d)', 'kingdom-training'), $response_code) . ': ' . $error_message;
                
                // Log the full error for debugging
                GAAL_Translation_Logger::error('Google Translate API batch error', array(
                    'status_code' => $response_code,
                    'error_message' => $error_message,
                    'response' => $response_data,
                    'raw_response' => $response_body,
                ));
                
                // Combine error message with details
                if (!empty($error_details)) {
                    $error_message .= ' - ' . implode(', ', $error_details);
                }
                
                return new WP_Error(
                    'api_error',
                    $error_message,
                    array(
                        'status' => $response_code,
                        'response' => $response_data,
                        'raw_response' => $response_body,
                    )
                );
            }
            
            // Extract translated texts
            $translations = array();
            if (isset($response_data['data']['translations'])) {
                foreach ($response_data['data']['translations'] as $translation) {
                    $translations[] = isset($translation['translatedText']) ? $translation['translatedText'] : '';
                }
            }
            
            return $translations;
        }
    }
}
