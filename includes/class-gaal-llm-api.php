<?php
/**
 * LLM API Integration (OpenAI-compatible, Provider-agnostic)
 * 
 * Handles LLM API calls for translation improvement and evaluation
 * Supports OpenAI, Anthropic Claude, Google Gemini, and other OpenAI-compatible providers
 */

if (!class_exists('GAAL_LLM_API')) {
    class GAAL_LLM_API {
        
        /**
         * API endpoint URL
         * 
         * @var string
         */
        protected $endpoint;
        
        /**
         * API key
         * 
         * @var string
         */
        protected $api_key;
        
        /**
         * Model name
         * 
         * @var string
         */
        protected $model;
        
        /**
         * Provider type (openai, anthropic, gemini, custom)
         * 
         * @var string
         */
        protected $provider;
        
        /**
         * Constructor
         * 
         * @param string $endpoint API endpoint URL
         * @param string $api_key API key
         * @param string $model Model name
         * @param string $provider Provider type
         */
        public function __construct($endpoint = '', $api_key = '', $model = 'gpt-4', $provider = 'custom') {
            $this->endpoint = rtrim($endpoint, '/');
            $this->api_key = $api_key;
            $this->model = $model;
            $this->provider = $provider;
        }
        
        /**
         * Detect provider from endpoint URL
         * 
         * @param string $endpoint Endpoint URL
         * @return string Provider type
         */
        protected function detect_provider($endpoint) {
            if (strpos($endpoint, 'openai.com') !== false) {
                return 'openai';
            } elseif (strpos($endpoint, 'anthropic.com') !== false) {
                return 'anthropic';
            } elseif (strpos($endpoint, 'generativelanguage.googleapis.com') !== false) {
                return 'gemini';
            } elseif (strpos($endpoint, 'openrouter.ai') !== false) {
                return 'openrouter';
            }
            return 'custom';
        }
        
        /**
         * Get provider-specific headers
         * 
         * @return array Headers array
         */
        protected function get_headers() {
            $headers = array(
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $this->api_key,
            );
            
            // Add provider-specific headers
            if ($this->provider === 'anthropic') {
                $headers['anthropic-version'] = '2023-06-01';
                $headers['x-api-key'] = $this->api_key;
                // Remove Bearer token for Anthropic (they use x-api-key)
                unset($headers['Authorization']);
            }
            
            return $headers;
        }
        
        /**
         * Make chat completion request
         * 
         * @param array $messages Messages array
         * @param array $options Additional options (temperature, max_tokens, etc.)
         * @return array|WP_Error Response data or error
         */
        protected function chat_completion($messages, $options = array()) {
            if (empty($this->endpoint) || empty($this->api_key)) {
                return new WP_Error('api_not_configured', __('LLM API is not configured', 'kingdom-training'));
            }
            
            // Detect provider if not set
            if ($this->provider === 'custom') {
                $this->provider = $this->detect_provider($this->endpoint);
            }
            
            // Build request URL
            $url = $this->endpoint . '/chat/completions';
            
            // Prepare request body
            $body = array(
                'model' => $this->model,
                'messages' => $messages,
                'temperature' => isset($options['temperature']) ? $options['temperature'] : 0.7,
                'max_tokens' => isset($options['max_tokens']) ? $options['max_tokens'] : 4000,
            );
            
            // Add provider-specific parameters
            if ($this->provider === 'anthropic') {
                // Anthropic uses slightly different format
                $body['max_tokens'] = isset($options['max_tokens']) ? $options['max_tokens'] : 4096;
            }
            
            // Merge additional options
            if (!empty($options)) {
                $body = array_merge($body, $options);
            }
            
            // Make request
            $args = array(
                'method' => 'POST',
                'headers' => $this->get_headers(),
                'body' => json_encode($body),
                'timeout' => 60,
            );
            
            $response = wp_remote_request($url, $args);
            
            if (is_wp_error($response)) {
                return new WP_Error(
                    'api_request_failed',
                    __('Failed to connect to LLM API', 'kingdom-training') . ': ' . $response->get_error_message(),
                    array('original_error' => $response)
                );
            }
            
            $response_code = wp_remote_retrieve_response_code($response);
            $response_body = wp_remote_retrieve_body($response);
            $response_data = json_decode($response_body, true);
            
            // Handle errors
            if ($response_code < 200 || $response_code >= 300) {
                $error_message = __('LLM API error', 'kingdom-training');
                if (isset($response_data['error']['message'])) {
                    $error_message = $response_data['error']['message'];
                } elseif (isset($response_data['error'])) {
                    $error_message = is_array($response_data['error']) ? json_encode($response_data['error']) : $response_data['error'];
                }
                
                return new WP_Error(
                    'api_error',
                    $error_message,
                    array('status' => $response_code, 'response' => $response_data)
                );
            }
            
            // Extract content from response
            if (isset($response_data['choices'][0]['message']['content'])) {
                return $response_data['choices'][0]['message']['content'];
            }
            
            // Handle Anthropic response format (if different)
            if ($this->provider === 'anthropic' && isset($response_data['content'][0]['text'])) {
                return $response_data['content'][0]['text'];
            }
            
            return new WP_Error(
                'invalid_response',
                __('Invalid response from LLM API', 'kingdom-training'),
                array('response' => $response_data)
            );
        }
        
        /**
         * Evaluate translation quality
         * 
         * @param string $original_text Original text
         * @param string $translated_text Translated text
         * @param string $target_language Target language code
         * @return array|WP_Error Evaluation result with score and feedback
         */
        public function evaluate_translation($original_text, $translated_text, $target_language) {
            $messages = array(
                array(
                    'role' => 'system',
                    'content' => 'You are a translation quality evaluator. Evaluate the quality of a translation and provide a score from 0-100 and brief feedback.',
                ),
                array(
                    'role' => 'user',
                    'content' => sprintf(
                        "Original text (English):\n%s\n\nTranslated text (%s):\n%s\n\nEvaluate the translation quality. Provide a JSON response with 'score' (0-100) and 'feedback' (brief explanation).",
                        $original_text,
                        $target_language,
                        $translated_text
                    ),
                ),
            );
            
            $result = $this->chat_completion($messages, array('temperature' => 0.3, 'max_tokens' => 500));
            
            if (is_wp_error($result)) {
                return $result;
            }
            
            // Try to parse JSON response
            $evaluation = json_decode($result, true);
            if (json_last_error() === JSON_ERROR_NONE && isset($evaluation['score'])) {
                return $evaluation;
            }
            
            // Fallback: return raw response with default score
            return array(
                'score' => 75,
                'feedback' => $result,
            );
        }
        
        /**
         * Improve translation using LLM
         * 
         * @param string $original_text Original text
         * @param string $translated_text Machine-translated text
         * @param string $target_language Target language code
         * @return string|WP_Error Improved translation
         */
        public function improve_translation($original_text, $translated_text, $target_language) {
            $messages = array(
                array(
                    'role' => 'system',
                    'content' => sprintf(
                        'You are a professional translator. Improve the machine translation to make it more natural, accurate, and culturally appropriate for %s speakers. Return only the improved translation without any explanation.',
                        $target_language
                    ),
                ),
                array(
                    'role' => 'user',
                    'content' => sprintf(
                        "Original text (English):\n%s\n\nMachine translation:\n%s\n\nProvide an improved, natural translation:",
                        $original_text,
                        $translated_text
                    ),
                ),
            );
            
            return $this->chat_completion($messages, array('temperature' => 0.7, 'max_tokens' => 4000));
        }
        
        /**
         * Test API connection with a simple request
         * 
         * @return string|WP_Error Test response or error
         */
        public function test_connection() {
            if (!$this->is_configured()) {
                return new WP_Error('api_not_configured', __('LLM API is not configured', 'kingdom-training'));
            }
            
            // Test with a simple chat completion
            $messages = array(
                array(
                    'role' => 'user',
                    'content' => 'Say "Connection test successful" and nothing else.',
                ),
            );
            
            return $this->chat_completion($messages, array('temperature' => 0.3, 'max_tokens' => 50));
        }
        
        /**
         * Check if API is configured
         * 
         * @return bool
         */
        public function is_configured() {
            return !empty($this->endpoint) && !empty($this->api_key) && !empty($this->model);
        }
    }
}
