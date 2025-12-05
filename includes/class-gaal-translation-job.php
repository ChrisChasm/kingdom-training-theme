<?php
/**
 * Translation Job Management
 * 
 * Handles translation job creation, status tracking, and resumption
 */

if (!class_exists('GAAL_Translation_Job')) {
    class GAAL_Translation_Job {
        
        /**
         * Job statuses
         */
        const STATUS_PENDING = 'pending';
        const STATUS_IN_PROGRESS = 'in_progress';
        const STATUS_COMPLETED = 'completed';
        const STATUS_FAILED = 'failed';
        
        /**
         * Post ID for job storage
         * 
         * @var int
         */
        protected $job_id;
        
        /**
         * Source post ID
         * 
         * @var int
         */
        protected $source_post_id;
        
        /**
         * Constructor
         * 
         * @param int $job_id Job post ID (optional, for existing jobs)
         */
        public function __construct($job_id = null) {
            $this->job_id = $job_id;
        }
        
        /**
         * Create a new translation job
         * 
         * @param int $source_post_id Source post ID
         * @param array $target_languages Array of target language codes
         * @return int|WP_Error Job post ID or error
         */
        public static function create($source_post_id, $target_languages = array()) {
            // Create a custom post type entry for the job
            $job_data = array(
                'post_title' => sprintf(__('Translation Job for Post #%d', 'kingdom-training'), $source_post_id),
                'post_content' => '',
                'post_status' => 'private',
                'post_type' => 'gaal_translation_job',
            );
            
            $job_id = wp_insert_post($job_data);
            
            if (is_wp_error($job_id)) {
                return $job_id;
            }
            
            // Store job metadata
            update_post_meta($job_id, '_translation_job_status', self::STATUS_PENDING);
            update_post_meta($job_id, '_translation_job_progress', array());
            update_post_meta($job_id, '_translation_job_data', array(
                'source_post_id' => $source_post_id,
                'target_languages' => $target_languages,
                'created_at' => current_time('mysql'),
            ));
            update_post_meta($job_id, '_translation_source_post_id', $source_post_id);
            update_post_meta($job_id, '_translation_last_updated', current_time('mysql'));
            
            return $job_id;
        }
        
        /**
         * Get job status
         * 
         * @return string Status
         */
        public function get_status() {
            if (!$this->job_id) {
                return '';
            }
            
            return get_post_meta($this->job_id, '_translation_job_status', true);
        }
        
        /**
         * Set job status
         * 
         * @param string $status Status
         * @return bool Success
         */
        public function set_status($status) {
            if (!$this->job_id) {
                return false;
            }
            
            $allowed_statuses = array(
                self::STATUS_PENDING,
                self::STATUS_IN_PROGRESS,
                self::STATUS_COMPLETED,
                self::STATUS_FAILED,
            );
            
            if (!in_array($status, $allowed_statuses)) {
                return false;
            }
            
            update_post_meta($this->job_id, '_translation_job_status', $status);
            update_post_meta($this->job_id, '_translation_last_updated', current_time('mysql'));
            
            return true;
        }
        
        /**
         * Get job progress
         * 
         * @return array Progress data
         */
        public function get_progress() {
            if (!$this->job_id) {
                return array();
            }
            
            $progress = get_post_meta($this->job_id, '_translation_job_progress', true);
            return is_array($progress) ? $progress : array();
        }
        
        /**
         * Update progress for a language
         * 
         * @param string $language Language code
         * @param string $status Status (pending, in_progress, completed, failed)
         * @param string $message Optional message
         * @return bool Success
         */
        public function update_language_progress($language, $status, $message = '') {
            if (!$this->job_id) {
                return false;
            }
            
            $progress = $this->get_progress();
            $progress[$language] = array(
                'status' => $status,
                'message' => $message,
                'updated_at' => current_time('mysql'),
            );
            
            update_post_meta($this->job_id, '_translation_job_progress', $progress);
            update_post_meta($this->job_id, '_translation_last_updated', current_time('mysql'));
            
            return true;
        }
        
        /**
         * Get job data
         * 
         * @return array Job data
         */
        public function get_data() {
            if (!$this->job_id) {
                return array();
            }
            
            $data = get_post_meta($this->job_id, '_translation_job_data', true);
            return is_array($data) ? $data : array();
        }
        
        /**
         * Get source post ID
         * 
         * @return int Source post ID
         */
        public function get_source_post_id() {
            if (!$this->job_id) {
                return 0;
            }
            
            return intval(get_post_meta($this->job_id, '_translation_source_post_id', true));
        }
        
        /**
         * Get target languages
         * 
         * @return array Target language codes
         */
        public function get_target_languages() {
            $data = $this->get_data();
            return isset($data['target_languages']) ? $data['target_languages'] : array();
        }
        
        /**
         * Check if job is completed
         * 
         * @return bool
         */
        public function is_completed() {
            return $this->get_status() === self::STATUS_COMPLETED;
        }
        
        /**
         * Check if job failed
         * 
         * @return bool
         */
        public function is_failed() {
            return $this->get_status() === self::STATUS_FAILED;
        }
        
        /**
         * Get completed languages
         * 
         * @return array Array of completed language codes
         */
        public function get_completed_languages() {
            $progress = $this->get_progress();
            $completed = array();
            
            foreach ($progress as $language => $data) {
                if (isset($data['status']) && $data['status'] === 'completed') {
                    $completed[] = $language;
                }
            }
            
            return $completed;
        }
        
        /**
         * Get remaining languages
         * 
         * @return array Array of remaining language codes
         */
        public function get_remaining_languages() {
            $target_languages = $this->get_target_languages();
            $completed = $this->get_completed_languages();
            
            return array_diff($target_languages, $completed);
        }
        
        /**
         * Resume interrupted job
         * 
         * @return bool Success
         */
        public function resume() {
            if (!$this->job_id) {
                return false;
            }
            
            $status = $this->get_status();
            
            // Only resume if job is pending or in_progress
            if ($status === self::STATUS_PENDING || $status === self::STATUS_IN_PROGRESS) {
                $this->set_status(self::STATUS_IN_PROGRESS);
                return true;
            }
            
            return false;
        }
        
        /**
         * Mark job as completed
         * 
         * @return bool Success
         */
        public function complete() {
            if (!$this->job_id) {
                return false;
            }
            
            $this->set_status(self::STATUS_COMPLETED);
            return true;
        }
        
        /**
         * Mark job as failed
         * 
         * @param string $error_message Error message
         * @return bool Success
         */
        public function fail($error_message = '') {
            if (!$this->job_id) {
                return false;
            }
            
            $this->set_status(self::STATUS_FAILED);
            
            if (!empty($error_message)) {
                update_post_meta($this->job_id, '_translation_job_error', $error_message);
            }
            
            return true;
        }
        
        /**
         * Get job ID
         * 
         * @return int Job ID
         */
        public function get_id() {
            return $this->job_id;
        }
    }
}

// Register custom post type for translation jobs
function gaal_register_translation_job_post_type() {
    register_post_type('gaal_translation_job', array(
        'labels' => array(
            'name' => __('Translation Jobs', 'kingdom-training'),
            'singular_name' => __('Translation Job', 'kingdom-training'),
        ),
        'public' => false,
        'show_ui' => false,
        'show_in_rest' => false,
        'supports' => array('title'),
    ));
}
add_action('init', 'gaal_register_translation_job_post_type');
