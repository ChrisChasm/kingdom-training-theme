<?php
/**
 * Base Translation API Class
 * 
 * Abstract base class for translation API implementations
 */

if (!class_exists('GAAL_Translation_API')) {
    abstract class GAAL_Translation_API {
        
        /**
         * API key or credentials
         * 
         * @var string
         */
        protected $api_key;
        
        /**
         * Constructor
         * 
         * @param string $api_key API key or credentials
         */
        public function __construct($api_key = '') {
            $this->api_key = $api_key;
        }
        
        /**
         * Translate text
         * 
         * @param string $text Text to translate
         * @param string $target_language Target language code
         * @param string $source_language Source language code (optional)
         * @return string|WP_Error Translated text or error
         */
        abstract public function translate($text, $target_language, $source_language = '');
        
        /**
         * Check if API is configured
         * 
         * @return bool
         */
        public function is_configured() {
            return !empty($this->api_key);
        }
        
        /**
         * Make HTTP request
         * 
         * @param string $url Request URL
         * @param array $args Request arguments
         * @return array|WP_Error Response data or error
         */
        protected function make_request($url, $args = array()) {
            $defaults = array(
                'timeout' => 30,
                'headers' => array(),
            );
            
            $args = wp_parse_args($args, $defaults);
            
            $response = wp_remote_request($url, $args);
            
            if (is_wp_error($response)) {
                return $response;
            }
            
            $response_code = wp_remote_retrieve_response_code($response);
            $response_body = wp_remote_retrieve_body($response);
            
            if ($response_code < 200 || $response_code >= 300) {
                return new WP_Error(
                    'api_error',
                    sprintf(__('API request failed with status %d', 'kingdom-training'), $response_code),
                    array('status' => $response_code, 'body' => $response_body)
                );
            }
            
            return json_decode($response_body, true);
        }
    }
}
