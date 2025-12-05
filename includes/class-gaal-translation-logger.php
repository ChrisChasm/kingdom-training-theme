<?php
/**
 * Translation Logger
 * 
 * Handles logging for translation operations, errors, and API usage
 */

if (!class_exists('GAAL_Translation_Logger')) {
    class GAAL_Translation_Logger {
        
        /**
         * Log levels
         */
        const LEVEL_INFO = 'info';
        const LEVEL_WARNING = 'warning';
        const LEVEL_ERROR = 'error';
        const LEVEL_DEBUG = 'debug';
        
        /**
         * Log a message
         * 
         * @param string $message Log message
         * @param string $level Log level
         * @param array $context Additional context
         * @return void
         */
        public static function log($message, $level = self::LEVEL_INFO, $context = array()) {
            $log_entry = array(
                'timestamp' => current_time('mysql'),
                'level' => $level,
                'message' => $message,
                'context' => $context,
            );
            
            // Store in WordPress options (last 100 entries)
            $logs = get_option('gaal_translation_logs', array());
            $logs[] = $log_entry;
            
            // Keep only last 100 entries
            if (count($logs) > 100) {
                $logs = array_slice($logs, -100);
            }
            
            update_option('gaal_translation_logs', $logs);
            
            // Also log to WordPress debug log if enabled
            if (defined('WP_DEBUG') && WP_DEBUG) {
                $log_message = sprintf(
                    '[GAAL Translation] [%s] %s',
                    strtoupper($level),
                    $message
                );
                
                if (!empty($context)) {
                    $log_message .= ' ' . json_encode($context);
                }
                
                error_log($log_message);
            }
        }
        
        /**
         * Log info message
         * 
         * @param string $message Log message
         * @param array $context Additional context
         * @return void
         */
        public static function info($message, $context = array()) {
            self::log($message, self::LEVEL_INFO, $context);
        }
        
        /**
         * Log warning message
         * 
         * @param string $message Log message
         * @param array $context Additional context
         * @return void
         */
        public static function warning($message, $context = array()) {
            self::log($message, self::LEVEL_WARNING, $context);
        }
        
        /**
         * Log error message
         * 
         * @param string $message Log message
         * @param array $context Additional context
         * @return void
         */
        public static function error($message, $context = array()) {
            self::log($message, self::LEVEL_ERROR, $context);
        }
        
        /**
         * Log debug message
         * 
         * @param string $message Log message
         * @param array $context Additional context
         * @return void
         */
        public static function debug($message, $context = array()) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                self::log($message, self::LEVEL_DEBUG, $context);
            }
        }
        
        /**
         * Log API usage for cost tracking
         * 
         * @param string $api_type API type (google_translate, llm)
         * @param string $operation Operation name
         * @param array $usage_data Usage data (tokens, characters, etc.)
         * @return void
         */
        public static function log_api_usage($api_type, $operation, $usage_data = array()) {
            $usage_entry = array(
                'timestamp' => current_time('mysql'),
                'api_type' => $api_type,
                'operation' => $operation,
                'usage' => $usage_data,
            );
            
            // Store API usage logs
            $usage_logs = get_option('gaal_translation_api_usage', array());
            $usage_logs[] = $usage_entry;
            
            // Keep only last 1000 entries
            if (count($usage_logs) > 1000) {
                $usage_logs = array_slice($usage_logs, -1000);
            }
            
            update_option('gaal_translation_api_usage', $usage_logs);
            
            // Log to main log
            self::info(
                sprintf('API usage: %s - %s', $api_type, $operation),
                $usage_data
            );
        }
        
        /**
         * Get recent logs
         * 
         * @param int $limit Number of logs to retrieve
         * @param string $level Filter by log level (optional)
         * @return array Array of log entries
         */
        public static function get_logs($limit = 50, $level = '') {
            $logs = get_option('gaal_translation_logs', array());
            
            // Filter by level if specified
            if (!empty($level)) {
                $logs = array_filter($logs, function($log) use ($level) {
                    return $log['level'] === $level;
                });
            }
            
            // Sort by timestamp (newest first)
            usort($logs, function($a, $b) {
                return strtotime($b['timestamp']) - strtotime($a['timestamp']);
            });
            
            // Limit results
            return array_slice($logs, 0, $limit);
        }
        
        /**
         * Clear logs
         * 
         * @return void
         */
        public static function clear_logs() {
            delete_option('gaal_translation_logs');
            delete_option('gaal_translation_api_usage');
        }
        
        /**
         * Get API usage statistics
         * 
         * @param string $api_type Filter by API type (optional)
         * @return array Usage statistics
         */
        public static function get_api_usage_stats($api_type = '') {
            $usage_logs = get_option('gaal_translation_api_usage', array());
            
            if (empty($usage_logs)) {
                return array();
            }
            
            // Filter by API type if specified
            if (!empty($api_type)) {
                $usage_logs = array_filter($usage_logs, function($log) use ($api_type) {
                    return $log['api_type'] === $api_type;
                });
            }
            
            // Calculate statistics
            $stats = array(
                'total_requests' => count($usage_logs),
                'by_operation' => array(),
            );
            
            foreach ($usage_logs as $log) {
                $operation = $log['operation'];
                if (!isset($stats['by_operation'][$operation])) {
                    $stats['by_operation'][$operation] = 0;
                }
                $stats['by_operation'][$operation]++;
            }
            
            return $stats;
        }
    }
}
